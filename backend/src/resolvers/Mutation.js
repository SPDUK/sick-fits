const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Mutations = {
  async createItem(parent, args, ctx, info) {
    // check if they are logged in
    const item = await ctx.db.mutation.createItem(
      {
        data: {
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
    const item = await ctx.db.query.item({ where }, `{id title}`);
    // 2. check if they own the item or have the permissions
    // TODO
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
};

module.exports = Mutations;
