// set up graphQL yoga (express server)

const { GraphQLServer } = require('graphql-yoga');
// resolvers find where the data comes from
// query resolvers -> get data
// mutation resolvers -> push data

const Mutation = require('./resolvers/Mutation');
const Query = require('./resolvers/Query');
const db = require('./db');

// create the graphQL yoga server

function createServer() {
  // needs typedefs for backend graphQL server
  return new GraphQLServer({
    typeDefs: 'src/schema.graphql',
    // match up everything in the schema witha mutation or query resolver
    resolvers: {
      Mutation,
      Query,
    },
    resolverValidationOptions: {
      requireResolversForResolveType: false,
    },
    // gives us the request info (headers, cookies etc)
    // allowing access the database from the resolvers for every request
    context: req => ({ ...req, db }),
  });
}

module.exports = createServer;
