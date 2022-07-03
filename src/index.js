import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadSchemaSync } from '@graphql-tools/load';
import { ApolloServer } from 'apollo-server';
import { join } from 'path';

//local imports
import db from './db';
import Comment from './resolvers/Comment';
import Mutation from './resolvers/Mutation';
import Post from './resolvers/Post';
import Query from './resolvers/Query';
import User from './resolvers/User';

const typeDefs = loadSchemaSync(join(__dirname, './schema.graphql'), {
  loaders: [new GraphQLFileLoader()]
});

const server = new ApolloServer({
  typeDefs,
  resolvers: {
    Query,
    Mutation,
    Post,
    User,
    Comment
  },
  context: {
    db
  }
});

server.listen().then(({ url }) => {
  console.log(`server is up and running in ${url}`);
});
