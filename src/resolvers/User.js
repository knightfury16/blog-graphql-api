import getUserId from '../utils/getUserId';

export default {
  posts: parent => {
    return parent.posts.filter(post => post.published === true);
  },
  email: (parent, args, { request }, info) => {
    const userId = getUserId(request, false);
    if (userId && userId === parent.id) {
      return parent.email;
    } else {
      return null;
    }
  }
};
