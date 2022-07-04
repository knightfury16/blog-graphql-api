import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadSchemaSync } from '@graphql-tools/load';
import { PubSub } from 'graphql-subscriptions';
import { join } from 'path';
import { createServer } from '@graphql-yoga/node';

//local imports
import db from './db';
import Comment from './resolvers/Comment';
import Mutation from './resolvers/Mutation';
import Post from './resolvers/Post';
import Query from './resolvers/Query';
import Subscription from './resolvers/Subscription';
import User from './resolvers/User';

const typeDefs = loadSchemaSync(join(__dirname, './schema.graphql'), {
  loaders: [new GraphQLFileLoader()]
});

const pubsub = new PubSub();
// Create your server
const server = createServer({
  schema: {
    typeDefs,
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
  }
});
// start the server and explore http://localhost:4000/graphql
server.start();
