const { Prisma } = require('prisma-binding');
// connects to the remote prisma DB and gives up the ability to query it with JS
// pull down the prisma.graphql file from the DB and pass it in as typeDefs
const db = new Prisma({
  typeDefs: 'src/generated/prisma.graphql',
  endpoint: process.env.PRISMA_ENDPOINT,
  secret: process.env.PRISMA_SECRET,
  debug: false,
});

module.exports = db;
