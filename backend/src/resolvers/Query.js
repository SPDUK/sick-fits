// when creating a new Query {} we need to set up a resolver

// a method on every query that lines up with every Query we have

// type(parent, args, ctx, info)
// parent =
// args = passed in eg. Books (id: 9999) {..}
// ctx = the context (request info, database)
// info = info around the graphql query coming in

// if the query is the same in both prisma and in the query you can forward the query from yoga to prisma using forwardTo

const { forwardTo } = require('prisma-binding');

const Query = {
  items: forwardTo('db'),
  // async items(parent, args, ctx, info) {
  //   const items = await ctx.db.query.items();
  //   return items;
  // },
};

module.exports = Query;
