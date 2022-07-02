import { ApolloServer, gql } from 'apollo-server';
// Dummy Users
const users = [
  {
    id: 1,
    name: 'Dev_Mishra',
    email: 'Aanand.Nehru@example.net',
    age: 22
  },
  {
    id: 2,
    name: 'Agastya_Adiga5',
    email: 'Chitramala21@example.net',
    age: 23
  },
  {
    id: 3,
    name: 'Agniprava48',
    email: 'Anasuya.Khatri22@example.com'
  }
];

const posts = [
  {
    id: 1,
    title: 'Chartreux',
    body: 'My dog',
    published: true
  },
  {
    id: 2,
    title: 'Paisley Terrier',
    body: 'My dot',
    published: false
  },
  {
    id: 3,
    title: 'Armenian Gampr dog',
    body: 'My dog',
    published: true
  }
];
// Schema
const typeDefs = gql`
  type Query {
    "Returns an array of all users"
    users(query: String): [User!]!

    "Returns user profile"
    me: User! #Returns user profile
    "Returns a post"
    post: Post!

    "Returns all the post"
    posts(query: String): [Post!]!
  }
  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
  }

  type Post {
    id: ID!
    title: String!
    body: String!
    published: Boolean!
  }
`;

// Resolver
const resolvers = {
  Query: {
    users: (parent, args, ctx, info) => {
      if (!args.query) return users;

      return users.filter(user => {
        return user.name.toLowerCase().includes(args.query.toLowerCase());
      });
    },

    posts: (parent, args, ctx, info) => {
      if (!args.query) return posts;

      return posts.filter(post => {
        const isTitleMtch = post.title.toLowerCase().includes(args.query.toLowerCase());
        const isBodyMtch = post.body.toLowerCase().includes(args.query.toLowerCase());
        return isTitleMtch || isBodyMtch;
      });
    },
    me: () => ({
      id: 'abc123',
      name: 'Mike',
      email: 'mike@gmail.com',
      age: 22
    }),
    post: () => ({
      id: 'abc456',
      title: 'My first blog',
      body: 'Body of my first blog',
      published: true
    })
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(({ url }) => {
  console.log(`server is up and running in ${url}`);
});
