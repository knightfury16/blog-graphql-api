export default {
  author: (parent, args, { db }, info) => {
    return db.users.find(user => {
      return user.id === parent.author;
    });
  },
  comments: (parent, _, { db }) => {
    return db.comments.filter(comment => comment.post === parent.id);
  }
};
