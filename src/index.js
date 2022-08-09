import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { scemaWithResolver } from './schema';
import { prismaSelect } from './utils/prismaSelect';
import { myPlugin } from './loggerPlugin';
import cors from 'cors';

const main = async () => {
  const app = express();
  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true
    })
  );

  const server = new ApolloServer({
    schema: scemaWithResolver,
    context: request => {
      return {
        prismaSelect,
        request
      };
    },
    plugins: [myPlugin],
    formatError: error => {
      const { field, message } = error.originalError;
      return { field, message };
    }
  });

  await server.start();

  server.applyMiddleware({ app, cors: false });

  const port = process.env.PORT;
  app.listen(port, () => {
    console.log(`Server ready at http://localhost:${port}${server.graphqlPath}`);
  });
};

main().catch(e => {
  console.log(e);
});
