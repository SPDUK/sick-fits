// when creating a new Query {} we need to set up a resolver

// a method on every query that lines up with every Query we have

// type(parent, args, ctx, info)
// parent =
// args = passed in eg. Books (id: 9999) {..}
// ctx = the context (request info, database)
// info = info around the graphql query coming in

// if the query is the same in both prisma and in the query you can forward the query from yoga to prisma using forwardTo

const { forwardTo } = require('prisma-binding');
const { hasPermission } = require('../utils');

const Query = {
  items: forwardTo('db'),
  item: forwardTo('db'),
  itemsConnection: forwardTo('db'),
  me(parent, args, ctx, info) {
    // check if there is a current userId on the request
    if (!ctx.request.userId) return null;
    return ctx.db.query.user(
      {
        where: { id: ctx.request.userId },
      },
      info
    );
  },
  async users(parent, args, ctx, info) {
    // check if user has permissions to query all users
    if (!ctx.request.userId) throw new Error('You must be logged in!');

    // throw an error if they do not have the correct permissions
    hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE']);
    // if they do, query all the users with an empty where to get all users.
    return ctx.db.query.users({}, info);
  },
  async order(parent, args, ctx, info) {
    // make sure they are logged in
    if (!ctx.request.userId) throw new Error('You must be logged in!');
    // query current order
    const order = await ctx.db.query.order(
      {
        where: { id: args.id },
      },
      info
    );

    const ownsOrder = order.user.id === ctx.request.userId;
    const hasPermissionToSeeOrder = ctx.request.user.permissions.includes(
      'ADMIN'
    );

    if (!ownsOrder || !hasPermissionToSeeOrder) {
      throw new Error('You do not have permission to see this.');
    }
    // check for permissions
    return order;
  },
  async orders(parent, args, ctx, info) {
    const { userId } = ctx.request;
    if (!userId) throw new Error('You must be logged in!');

    return ctx.db.query.orders(
      {
        where: {
          user: { id: userId },
        },
      },
      info
    );
  },
};

module.exports = Query;
