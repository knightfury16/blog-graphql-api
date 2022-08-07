import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { scemaWithResolver } from './schema';
import { prismaSelect } from './utils/prismaSelect';
import morgan from 'morgan';

const main = async () => {
  const app = express();
  app.use(morgan('dev'));

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
