require('dotenv').config({ path: 'variables.env' });
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

// TODO use express middleware to handle cookies (JWT)
// TODO use express middleware to populate current user

// uses CORS, can only hit endpoint from approved URLs (frontend server)
server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL,
    },
  },
  info => {
    console.log(`Server is now running on port http://localhost:${info.port}`);
  }
);
