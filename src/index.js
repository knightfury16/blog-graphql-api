import { PrismaSelect } from '@paljs/plugins';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import express from 'express';
import { PubSub } from 'graphql-subscriptions';
import { useServer } from 'graphql-ws/lib/use/ws';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { ApolloServer } from 'apollo-server-express';
import { scemaWithResolver } from './schema';

// For the contex
const pubsub = new PubSub();
const prismaSelect = info => {
  return new PrismaSelect(info).value;
};

const main = async () => {
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
        return { pubsub };
      }
    },
    wsServer
  );

  const server = new ApolloServer({
    schema: scemaWithResolver,
    context: request => {
      return {
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
  app.listen(port, () => {
    console.log(`Server ready at http://localhost:${port}${server.graphqlPath}`);
  });
};

main().catch(e => {
  console.log(e);
});
