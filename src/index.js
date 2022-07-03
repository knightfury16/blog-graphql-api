import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { ApolloServer } from 'apollo-server';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
const { loadSchemaSync } = require('@graphql-tools/load');

//local imports
import db from './db';

// Resolver
const resolvers = {
  Query: {
    users: (parent, args, { db }, info) => {
      if (!args.query) return db.users;

      return db.users.filter(user => {
        return user.name.toLowerCase().includes(args.query.toLowerCase());
      });
    },

    posts: (parent, args, { db }, info) => {
      if (!args.query) return db.posts;

      return db.posts.filter(post => {
        const isTitleMtch = post.title.toLowerCase().includes(args.query.toLowerCase());
        const isBodyMtch = post.body.toLowerCase().includes(args.query.toLowerCase());
        return isTitleMtch || isBodyMtch;
      });
    },
    comments: (_, __, { db }) => {
      return db.comments;
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
  Mutation: {
    createUser: (parent, args, { db }) => {
      const isEmailTaken = db.users.some(user => user.email === args.data.email);
      // if (isEmailTaken) throw new Error('Email Taken!!');

      const user = {
        id: uuidv4(),
        ...args.data
      };

      db.users.push(user);

      return user;
    },
    deleteUser: (_, args, { db }) => {
      const userIndex = db.users.findIndex(user => user.id === args.id);

      if (userIndex == -1) throw new Error('User not found!');

      db.posts = db.posts.filter(post => {
        const match = post.author === args.id;

        if (match) {
          db.comments = db.comments.filter(comment => comment.post != post.id);
        }
        return !match;
      });

      db.comments = db.comments.filter(comment => comment.author != args.id);

      const deletedUsers = db.users.splice(userIndex, 1);

      return deletedUsers[0];
    },
    createPost: (parent, args, { db }) => {
      const userExits = db.users.some(user => user.id === args.data.author);

      if (!userExits) throw new Error('User Not Found!');

      const post = {
        id: uuidv4(),
        ...args.data
      };

      db.posts.push(post);

      return post;
    },
    deletePost: (_, args, { db }) => {
      const postIndex = db.posts.findIndex(post => post.id === args.id);

      if (postIndex == -1) throw new Error('Post not found!');

      db.comments = db.comments.filter(comment => comment.post !== args.id);

      const deletedPosts = db.posts.splice(postIndex, 1);

      return deletedPosts[0];
    },
    createComment: (_, args, { db }) => {
      const userExits = db.users.some(user => user.id === args.data.author);
      if (!userExits) throw new Error('User not found!');

      const postExits = db.posts.find(post => post.id === args.data.post);
      if (!postExits) throw new Error('Post not found!');

      if (!postExits.published) throw new Error('Post not published!');

      const comment = {
        id: uuidv4(),
        ...args.data
      };

      db.comments.push(comment);

      return comment;
    },
    deleteComment: (_, args, { db }) => {
      const commentIndex = db.comments.findIndex(comment => comment.id === args.id);

      if (commentIndex === -1) throw new Error('Comment not found!');

      const deletedComments = db.comments.splice(commentIndex, 1);

      return deletedComments[0];
    }
  },
  Post: {
    author: (parent, args, { db }, info) => {
      return db.users.find(user => {
        return user.id === parent.author;
      });
    },
    comments: (parent, _, { db }) => {
      return db.comments.filter(comment => comment.post === parent.id);
    }
  },
  User: {
    posts: (parent, _, { db }) => {
      return db.posts.filter(post => {
        return post.author === parent.id;
      });
    },
    comments: (parent, _, { db }) => {
      return db.comments.filter(comment => comment.author === parent.id);
    }
  },
  Comment: {
    author: (parent, _, { db }) => {
      return db.users.find(user => {
        return user.id === parent.author;
      });
    },
    post: (parent, _, { db }) => {
      return db.posts.find(post => post.id === parent.post);
    }
  }
};

const typeDefs = loadSchemaSync(join(__dirname, './schema.graphql'), {
  loaders: [new GraphQLFileLoader()]
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: {
    db
  }
});

server.listen().then(({ url }) => {
  console.log(`server is up and running in ${url}`);
});
