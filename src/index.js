import { createPubSub, createServer } from '@graphql-yoga/node';
import { readFileSync } from 'fs';
import { join } from 'path';

//local imports
import db from './db';
import Comment from './resolvers/Comment';
import Mutation from './resolvers/Mutation';
import Post from './resolvers/Post';
import Query from './resolvers/Query';
import Subscription from './resolvers/Subscription';
import User from './resolvers/User';

const pubsub = createPubSub();
// Create your server
const server = createServer({
  schema: {
    typeDefs: readFileSync(join(__dirname, './schema.graphql'), 'utf-8'),
    resolvers: {
      Query,
      Mutation,
      Subscription,
      Post,
      User,
      Comment
    }
  },
  context: {
    db,
    pubsub
  },
  maskedErrors: false
});
// start the server and explore http://localhost:4000/graphql
server.start();
