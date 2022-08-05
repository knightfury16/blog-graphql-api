import { PrismaSelect } from '@paljs/plugins';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { scemaWithResolver } from './schema';

// For the contex
const prismaSelect = info => {
  return new PrismaSelect(info).value;
};

const main = async () => {
  const app = express();

  const server = new ApolloServer({
    schema: scemaWithResolver,
    context: request => {
      return {
        prismaSelect,
        request
      };
    }
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
