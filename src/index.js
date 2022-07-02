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
    name: 'Agastya_Adiga',
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
    title: 'Learn Apple',
    body: 'Apple is good for dog',
    published: true,
    author: 1
  },
  {
    id: 2,
    title: 'Ball',
    body: 'New type of ball game',
    published: false,
    author: 3
  },
  {
    id: 3,
    title: 'Cat',
    body: 'Cat always land on feet',
    published: true,
    author: 1
  }
];

const comments = [
  {
    id: 12,
    text: 'Wow!',
    author: 1,
    post: 1
  },
  {
    id: 31,
    text: 'Nice Dog',
    author: 2,
    post: 3
  },
  {
    id: 44,
    text: 'Does he bite',
    author: 1,
    post: 2
  },
  {
    id: 11,
    text: 'Cute!',
    author: 2,
    post: 1
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

    "returns all the comments"
    comments: [Comment!]!
  }
  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
    posts: [Post!]!
    comments: [Comment!]!
  }

  type Post {
    id: ID!
    title: String!
    body: String!
    published: Boolean!
    author: User!
    comments: [Comment!]!
  }

  type Comment {
    id: ID!
    text: String!
    author: User!
    post: Post!
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
    comments: () => {
      return comments;
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
  },
  Post: {
    author: (parent, args, ctx, info) => {
      return users.find(user => {
        return user.id === parent.author;
      });
    },
    comments: parent => {
      return comments.filter(comment => comment.post === parent.id);
    }
  },
  User: {
    posts: parent => {
      return posts.filter(post => {
        return post.author === parent.id;
      });
    },
    comments: parent => {
      return comments.filter(comment => comment.author === parent.id);
    }
  },
  Comment: {
    author: parent => {
      return users.find(user => {
        return user.id === parent.author;
      });
    },
    post: parent => {
      return posts.find(post => post.id === parent.post);
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(({ url }) => {
  console.log(`server is up and running in ${url}`);
});
