import { v4 as uuidv4 } from 'uuid';
import { GraphQLYogaError } from '@graphql-yoga/node';
import prisma from '../prisma';

export default {
  createUser: async (parent, args, { db }) => {
    try {
      const user = await prisma.user.create({ data: args.data });
      return user;
    } catch (error) {
      if (error.code === 'P2002') throw new GraphQLYogaError('Email Taken!');
      throw new GraphQLYogaError('Error!!');
    }
  },
  deleteUser: (_, args, { db }) => {
    const userIndex = db.users.findIndex(user => user.id === args.id);

    if (userIndex == -1) throw new GraphQLYogaError('User not found!');

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
  updateUser: (parent, args, { db }) => {
    const { id, data } = args;

    const user = db.users.find(user => user.id === id);

    if (!user) throw new GraphQLYogaError('User not Found!');

    if (typeof data.email === 'string') {
      const emailTaken = db.users.some(user => user.email === data.email);

      if (emailTaken) throw new GraphQLYogaError('Email Taken');

      user.email = data.email;
    }

    if (typeof data.name === 'string') {
      user.name = data.name;
    }

    if (typeof data.age != 'undefined') {
      user.age = data.age;
    }
    return user;
  },
  createPost: async (parent, { data }, { db, pubsub }) => {
    const userExits = await prisma.user.findUnique({
      where: { id: data.author }
    });

    if (!userExits) throw new GraphQLYogaError('User Not Found!');

    const post = await prisma.post.create({
      data: {
        title: data.title,
        body: data.body,
        published: data.published,
        author: {
          connect: {
            id: data.author
          }
        }
      }
    });

    if (post.published)
      pubsub.publish('post', {
        post: {
          mutation: 'CREATED',
          data: post
        }
      });

    return post;
  },
  deletePost: (_, args, { db, pubsub }) => {
    const postIndex = db.posts.findIndex(post => post.id === args.id);

    if (postIndex == -1) throw new GraphQLYogaError('Post not found!');

    db.comments = db.comments.filter(comment => comment.post !== args.id);

    const [post] = db.posts.splice(postIndex, 1);

    if (post.published) {
      pubsub.publish('post', {
        post: {
          mutation: 'DELETED',
          data: post
        }
      });
    }

    return post;
  },
  updatePost: (_, { id, data }, { db, pubsub }) => {
    const post = db.posts.find(post => post.id === id);
    const originalPost = { ...post };

    if (!post) throw new GraphQLYogaError('Post not Found');

    if (typeof data.title === 'string') {
      post.title = data.title;
    }

    if (typeof data.body === 'string') {
      post.body = data.body;
    }
    if (typeof data.published === 'boolean') {
      post.published = data.published;

      if (originalPost.published && !post.published) {
        // deleted
        pubsub.publish('post', {
          post: {
            mutation: 'DELETED',
            data: originalPost
          }
        });
      } else if (!originalPost.published && post.published) {
        // created
        pubsub.publish('post', {
          post: {
            mutation: 'CREATED',
            data: post
          }
        });
      } else if (post.published) {
        // updated
        pubsub.publish('post', {
          post: {
            mutation: 'UPDATED',
            data: post
          }
        });
      }
    }
    return post;
  },
  createComment: async (_, { data }, { db, pubsub }) => {
    const user = await prisma.user.findUnique({ where: { id: data.author } });
    if (!user) throw new GraphQLYogaError('User not found!');

    const post = await prisma.post.findUnique({ where: { id: data.post } });
    if (!post) throw new GraphQLYogaError('Post not found!');

    if (!post.published) throw new GraphQLYogaError('Post not published!');

    const comment = await prisma.comment.create({
      data: {
        text: data.text,
        author: {
          connect: {
            id: data.author
          }
        },
        post: {
          connect: {
            id: data.post
          }
        }
      }
    });

    pubsub.publish(`comment ${data.post}`, {
      comment: {
        mutation: 'CREATED',
        data: comment
      }
    });

    return comment;
  },
  deleteComment: (_, args, { db, pubsub }) => {
    const commentIndex = db.comments.findIndex(comment => comment.id === args.id);

    if (commentIndex === -1) throw new GraphQLYogaError('Comment not found!');

    const [deletedComment] = db.comments.splice(commentIndex, 1);

    pubsub.publish(`comment ${deletedComment.post}`, {
      comment: {
        mutation: 'DELETED',
        data: deletedComment
      }
    });

    return deletedComment;
  },
  updateComment: (_, { id, data }, { db, pubsub }) => {
    const comment = db.comments.find(comment => comment.id === id);

    if (!comment) throw new GraphQLYogaError('Comment not Found');
    if (typeof data.text === 'string') {
      comment.text = data.text;
    }

    pubsub.publish(`comment ${comment.post}`, {
      comment: {
        mutation: 'Updated',
        data: comment
      }
    });
    return comment;
  }
};
