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
};

module.exports = Mutations;
