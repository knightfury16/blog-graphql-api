import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadSchema } from '@graphql-tools/load';
import { addResolversToSchema } from '@graphql-tools/schema';
import { PrismaSelect } from '@paljs/plugins';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import express from 'express';
import { PubSub } from 'graphql-subscriptions';
import { useServer } from 'graphql-ws/lib/use/ws';
import { createServer } from 'http';
import { join } from 'path';
import { WebSocketServer } from 'ws';
import { ApolloServer } from 'apollo-server-express';

//local imports
import db from './db';
import Comment from './resolvers/Comment';
import Mutation from './resolvers/Mutation';
import Post from './resolvers/Post';
import Query from './resolvers/Query';
import Subscription from './resolvers/Subscription';
import User from './resolvers/User';

// For the contex
const pubsub = new PubSub();
const prismaSelect = info => {
  return new PrismaSelect(info).value;
};

const main = async () => {
  const schema = await loadSchema(join(__dirname, './schema.graphql'), {
    loaders: [new GraphQLFileLoader()]
  });

  // Write some resolvers
  const resolvers = {
    Query,
    Mutation,
    Subscription,
    Post,
    User,
    Comment
  };

  const scemaWithResolver = addResolversToSchema({ schema, resolvers });

  const app = express();
  const httpServer = createServer(app);

  // Creating the WebSocket server
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql'
  });

  const serverCleanup = useServer(
    {
      schema: scemaWithResolver,
      context: (ctx, msg, args) => {
        console.log('CONTEXT OF SUB:', ctx);
        console.log('MSG OF SUB:', msg);
        console.log('ARGS OF SUB:', args);

        return { pubsub };
      }
    },
    wsServer
  );

  const server = new ApolloServer({
    schema: scemaWithResolver,
    context: request => {
      return {
        db,
        pubsub,
        prismaSelect,
        request
      };
    },
    plugins: [
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({ httpServer }),

      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            }
          };
        }
      }
    ]
  });

  await server.start();

  server.applyMiddleware({ app });

  const port = process.env.PORT;
  httpServer.listen(port, () => {
    console.log(`Server ready at http://localhost:${port}${server.graphqlPath}`);
  });
};

main().catch(e => {
  console.log(e);
});
