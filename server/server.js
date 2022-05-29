const express = require('express');
const { ApolloServer } = require('apollo-server-express')
const path = require('path');

const { typeDefs, resolvers } = require('./schemas')
const { authMiddleware } = require('./utils/auth')
const db = require('./config/connection');

const app = express();
const PORT = process.env.PORT || 3001;
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
})

server.applyMiddleware({ app })

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`🌍 Now listening on localhost:${PORT}`)
    console.log(`Use Graph QL at http://localhost:${PORT}${server.graphqlPath}`)
  });
});
