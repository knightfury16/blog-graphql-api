import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { ApolloServer } from 'apollo-server';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
const { loadSchemaSync } = require('@graphql-tools/load');

// Dummy Users
let users = [
  {
    id: '1',
    name: 'Dev_Mishra',
    email: 'Aanand.Nehru@example.net',
    age: 22
  },
  {
    id: '2',
    name: 'Agastya_Adiga',
    email: 'Chitramala21@example.net',
    age: 23
  },
  {
    id: '3',
    name: 'Agniprava48',
    email: 'Anasuya.Khatri22@example.com'
  }
];

let posts = [
  {
    id: '1',
    title: 'Learn Apple',
    body: 'Apple is good for dog',
    published: true,
    author: '1'
  },
  {
    id: '2',
    title: 'Ball',
    body: 'New type of ball game',
    published: false,
    author: '3'
  },
  {
    id: '3',
    title: 'Cat',
    body: 'Cat always land on feet',
    published: true,
    author: '1'
  }
];

let comments = [
  {
    id: '12',
    text: 'Wow!',
    author: '1',
    post: '1'
  },
  {
    id: '31',
    text: 'Nice Dog',
    author: '2',
    post: '3'
  },
  {
    id: '44',
    text: 'Does he bite',
    author: '2',
    post: '2'
  },
  {
    id: '11',
    text: 'Cute!',
    author: '1',
    post: '2'
  }
];

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
  Mutation: {
    createUser: (parent, args) => {
      const isEmailTaken = users.some(user => user.email === args.data.email);
      // if (isEmailTaken) throw new Error('Email Taken!!');

      const user = {
        id: uuidv4(),
        ...args.data
      };

      users.push(user);

      return user;
    },
    deleteUser: (_, args) => {
      const userIndex = users.findIndex(user => user.id === args.id);

      if (userIndex == -1) throw new Error('User not found!');

      posts = posts.filter(post => {
        const match = post.author === args.id;

        if (match) {
          comments = comments.filter(comment => comment.post != post.id);
        }
        return !match;
      });

      comments = comments.filter(comment => comment.author != args.id);

      const deletedUsers = users.splice(userIndex, 1);

      return deletedUsers[0];
    },
    createPost: (parent, args) => {
      const userExits = users.some(user => user.id === args.data.author);

      if (!userExits) throw new Error('User Not Found!');

      const post = {
        id: uuidv4(),
        ...args.data
      };

      posts.push(post);

      return post;
    },
    deletePost: (_, args) => {
      const postIndex = posts.findIndex(post => post.id === args.id);

      if (postIndex == -1) throw new Error('Post not found!');

      comments = comments.filter(comment => comment.post !== args.id);

      const deletedPosts = posts.splice(postIndex, 1);

      return deletedPosts[0];
    },
    createComment: (_, args) => {
      const userExits = users.some(user => user.id === args.data.author);
      if (!userExits) throw new Error('User not found!');

      const postExits = posts.find(post => post.id === args.data.post);
      if (!postExits) throw new Error('Post not found!');

      if (!postExits.published) throw new Error('Post not published!');

      const comment = {
        id: uuidv4(),
        ...args.data
      };

      comments.push(comment);

      return comment;
    },
    deleteComment: (_, args) => {
      const commentIndex = comments.findIndex(comment => comment.id === args.id);

      if (commentIndex === -1) throw new Error('Comment not found!');

      const deletedComments = comments.splice(commentIndex, 1);

      return deletedComments[0];
    }
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

const typeDefs = loadSchemaSync(join(__dirname, './schema.graphql'), {
  loaders: [new GraphQLFileLoader()]
});

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(({ url }) => {
  console.log(`server is up and running in ${url}`);
});
