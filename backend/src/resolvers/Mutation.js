const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { transport, makeANiceEmail } = require('../mail');
const { hasPermission } = require('../utils');
const stripe = require('../stripe');

const Mutations = {
  async createItem(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that!');
    }
    // check if they are logged in
    const item = await ctx.db.mutation.createItem(
      {
        data: {
          //  this is how we create a relationship between the Item and the User
          user: {
            connect: {
              id: ctx.request.userId,
            },
          },
          ...args,
        },
      },
      info
    );
    return item;
  },

  // knows what to return by passing in info
  updateItem(parent, args, ctx, info) {
    // take a copy of the updates
    const updates = { ...args };
    // remove ID from updates
    delete updates.id;
    // run update method
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id,
        },
      },
      info
    );
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    // 1. find item (raw graphql query)
    const item = await ctx.db.query.item({ where }, `{id title user { id }}`);
    // 2. check if they own the item or have the permissions
    const ownsItem = item.user.id === ctx.request.userId;
    const hasPermissions = ctx.request.user.permissions.some(permission =>
      ['ADMIN', 'ITEMDELETE'].includes(permission)
    );
    if (!ownsItem && hasPermissions) {
      throw new Error("You don't have permission to do that!");
    }
    // 3. delete it!
    return ctx.db.mutation.deleteItem({ where }, info);
  },
  async signUp(parent, args, ctx, info) {
    args.email = args.email.toLowerCase();
    const hashedPassword = await bcrypt.hash(args.password, 10);
    // create user in database
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password: hashedPassword,
          permissions: { set: ['USER'] },
        },
      },
      info
    );
    // create JWT token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // set jwt as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    });
    return user;
  },
  async signIn(parent, { email, password }, ctx, info) {
    // 1. Check if  there is a user with that email
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) throw new Error(`No such user found for email ${email}`);
    // 2. Check if the password is correct
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Invalid Password');
    // 3. Generate JWT
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // 4. Set the cookie with the token
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    });
    // 5. Return user
    return user;
  },
  signOut(parent, args, ctx, info) {
    // check if there is a current userId on the request
    ctx.response.clearCookie('token');
    return { message: 'You have been signed out!' };
  },
  async requestReset(parent, args, ctx, info) {
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user) throw new Error(`No such user found for email ${args.email}`);

    // create a random string to use as the reset token and an expiry 1 hour from now
    const randomBytesPromisified = promisify(randomBytes);
    const resetToken = (await randomBytesPromisified(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000;

    // update user with the new resetToken and expiry
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry },
    });

    // Email the reset token
    const mailResponse = await transport.sendMail({
      from: 'noreply@spdevuk.com',
      to: user.email,
      subject: 'Your Password Reset Token for Sick Fits',
      html: makeANiceEmail(
        `Your Password Reset Token is here! \n\n 
        <a href="${
          process.env.FRONTEND_URL
        }/reset?resetToken=${resetToken}">Click here to reset</a>`
      ),
    });

    return { message: 'Thanks!' };
  },
  async resetPassword(parent, args, ctx, info) {
    if (args.password !== args.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // query all users to find one with a valid resetToken and expiry
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000,
      },
    });
    if (!user) throw new Error('This reset token is either invalid or expired');

    // hash the new password and update the user's password, remove the token and expiry
    const password = await bcrypt.hash(args.password, 10);
    const updatedUser = await ctx.db.mutation.updateUser({
      where: {
        email: user.email,
      },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
    // create a new JWT and add it to cookies
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);

    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    });
    return updatedUser;
  },
  async updatePermissions(parent, args, ctx, info) {
    // check if they are logged in
    if (!ctx.request.userId) throw new Error('You must be logged in!');
    // query current user
    const currentUser = await ctx.db.query.user(
      {
        where: {
          id: ctx.request.userId,
        },
      },
      info
    );
    // check if they have permissions to do this
    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);
    // update the permissions
    return ctx.db.mutation.updateUser(
      {
        data: {
          permissions: {
            // because permissions is it's own enum we added onto the datamodel we have to use set:
            set: args.permissions,
          },
        },
        where: {
          id: args.userId,
        },
      },
      info
    );
  },
  async addToCart(parent, args, ctx, info) {
    // auth
    const { userId } = ctx.request;
    if (!userId) throw new Error('You must be signed in to do that!');
    //  query the user's current cart
    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id },
      },
    });

    //  check if the item is already in the cart - inc by 1 if it is
    if (existingCartItem) {
      return ctx.db.mutation.updateCartItem(
        {
          data: { quantity: existingCartItem.quantity + 1 },
          where: { id: existingCartItem.id },
        },
        info
      );
    }
    //  create a new CartItem
    return ctx.db.mutation.createCartItem(
      {
        data: {
          user: { connect: { id: userId } },
          item: { connect: { id: args.id } },
        },
      },
      info
    );
  },

  async removeFromCart(parent, args, ctx, info) {
    // manual query because the final query does not ask for the user and we need the id
    const cartItem = await ctx.db.query.cartItem(
      {
        where: {
          id: args.id,
        },
      },
      `{id, user { id }}`
    );

    if (!cartItem) {
      throw new Error('No cart item found for that user');
    }
    if (cartItem.user.id !== ctx.request.userId) {
      throw new Error('No cart item found for that user');
    }

    return ctx.db.mutation.deleteCartItem(
      {
        where: { id: args.id },
      },
      info
    );
  },
  async createOrder(parent, args, ctx, info) {
    // 1. Query the current user and make sure they are signed in
    const { userId } = ctx.request;
    if (!userId)
      throw new Error('You must be signed in to complete this order.');
    const user = await ctx.db.query.user(
      { where: { id: userId } },
      `{
      id
      name
      email
      cart {
        id
        quantity
        item { title price id description image largeImage }
      }}`
    );
    // 2. recalculate the total for the price
    const amount = user.cart.reduce(
      (tally, cartItem) => tally + cartItem.item.price * cartItem.quantity,
      0
    );
    // 3. Create the stripe charge (turn token into $$$)
    const charge = await stripe.charges.create({
      amount,
      currency: 'USD',
      source: args.token,
    });
    // 4. Convert the CartItems to OrderItems
    const orderItems = user.cart.map(cartItem => {
      const orderItem = {
        ...cartItem.item,
        quantity: cartItem.quantity,
        user: { connect: { id: userId } },
      };
      delete orderItem.id;
      return orderItem;
    });
    // 5. create the Order
    const order = await ctx.db.mutation
      .createOrder({
        data: {
          total: charge.amount,
          charge: charge.id,
          items: { create: orderItems },
          user: { connect: { id: userId } },
        },
      })
      .catch(err => {
        throw new Error('There was an error creating that order');
      });
    // 6. Clean up - clear the users cart, delete cartItems
    const cartItemIds = user.cart.map(cartItem => cartItem.id);
    await ctx.db.mutation.deleteManyCartItems({
      where: {
        id_in: cartItemIds,
      },
    });

    // 7. Return the Order to the client
    return order;
  },
};

module.exports = Mutations;
