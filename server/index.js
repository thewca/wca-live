const path = require('path');
/* Load envinroment variables. */
require('dotenv').config({ path: path.join(__dirname, '.env') });

const fs = require('fs');
const http = require('http');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const { ApolloServer, gql } = require('apollo-server-express');
const { ObjectId } = require('mongodb');
const oauth = require('./oauth');
const resolvers = require('./resolvers');
const mongo = require('./mongo-connector');
const competitionLoaderFactory = require('./competition-loader');
const { PRODUCTION, PORT, SESSION_SECRET } = require('./config');

const app = express();

(async () => {
  await mongo.connect();

  app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: PRODUCTION,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    },
    proxy: true,
    store: new MongoStore({
      collection: 'cookieSessions',
      client: mongo.db.client,
    }),
  }));

  app.use('/oauth', oauth);

  const server = new ApolloServer({
    typeDefs: gql(fs.readFileSync(__dirname.concat('/schema.graphql'), 'utf8')),
    resolvers,
    context: ({ req, connection }) => {
      if (connection) {
        /* For subscriptions over websocket. */
        return {};
      } else {
        /* For queries and mutations over http. */
        return {
          session: req.session,
        };
      }
    },
    subscriptions: '/api',
  });

  server.applyMiddleware({
    app,
    path: '/api',
    cors: PRODUCTION ? false : { origin: 'http://localhost:3000', credentials: true },
    bodyParserConfig: { limit: '5mb' },
  });

  const httpServer = http.createServer(app);
  server.installSubscriptionHandlers(httpServer);

  const buildPath = path.join(__dirname, '../client/build');
  app.use(express.static(buildPath));
  app.get('/*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });

  httpServer.listen({ port: PORT }, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
})();
