import { v4 as uuidv4 } from 'uuid';

export default {
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
  updateUser: (parent, args, { db }) => {
    const { id, data } = args;

    const user = db.users.find(user => user.id === id);

    if (!user) throw new Error('User not Found!');

    if (typeof data.email === 'string') {
      const emailTaken = db.users.some(user => user.email === data.email);

      if (emailTaken) throw new Error('Email Taken');

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
  updatePost: (_, { id, data }, { db }) => {
    const post = db.posts.find(post => post.id === id);

    if (!post) throw new Error('Post not Found');

    if (typeof data.title === 'string') {
      post.title = data.title;
    }

    if (typeof data.body === 'string') {
      post.body = data.body;
    }
    if (typeof data.published === 'boolean') {
      post.published = data.published;
    }
    return post;
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
  },
  updateComment: (_, { id, data }, { db }) => {
    const comment = db.comments.find(comment => comment.id === id);

    if (!comment) throw new Error('Comment not Found');
    if (typeof data.text === 'string') {
      comment.text = data.text;
    }
    return comment;
  }
};
