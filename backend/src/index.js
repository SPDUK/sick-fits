// using cookies because they are sent with every request, localstorage is not
const cookieParser = require('cookie-parser');
require('dotenv').config({ path: 'variables.env' });
const jwt = require('jsonwebtoken');
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

// use express middleware to handle cookies (JWT)
server.express.use(cookieParser());
// middleware to decode JWT and get the user ID
server.express.use((req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    // put userId onto request for future requests
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    req.userId = userId;
  }
  next();
});
// TODO use express middleware to populate current user
server.express.use(async (req, res, next) => {
  if (!req.userId) return next();
  const user = await db.query.user(
    { where: { id: req.userId } },
    '{id, permissions, email, name}'
  );
  req.user = user;
  next();
});

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
