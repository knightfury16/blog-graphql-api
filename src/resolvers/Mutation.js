import { v4 as uuidv4 } from 'uuid';
import { GraphQLYogaError } from '@graphql-yoga/node';

export default {
  createUser: (parent, args, { db }) => {
    const isEmailTaken = db.users.some(user => user.email === args.data.email);
    if (isEmailTaken) throw new GraphQLYogaError('Email Taken!!');

    const user = {
      id: uuidv4(),
      ...args.data
    };

    db.users.push(user);

    return user;
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
  createPost: (parent, args, { db, pubsub }) => {
    const userExits = db.users.some(user => user.id === args.data.author);

    if (!userExits) throw new GraphQLYogaError('User Not Found!');

    const post = {
      id: uuidv4(),
      ...args.data
    };

    db.posts.push(post);

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
  createComment: (_, args, { db, pubsub }) => {
    const userExits = db.users.some(user => user.id === args.data.author);
    if (!userExits) throw new GraphQLYogaError('User not found!');

    const postExits = db.posts.find(post => post.id === args.data.post);
    if (!postExits) throw new GraphQLYogaError('Post not found!');

    if (!postExits.published) throw new GraphQLYogaError('Post not published!');

    const comment = {
      id: uuidv4(),
      ...args.data
    };

    db.comments.push(comment);
    // console.log(`comment ${args.data.post}`);
    pubsub.publish(`comment ${args.data.post}`, {
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
