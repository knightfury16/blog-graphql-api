export default {
  comment: {
    subscribe: (_, { postId }, { db, pubsub }) => {
      const post = db.posts.find(post => post.id === postId && post.published);
      let count = 0;
      if (!post) throw new GraphQLYogaError('No post found');

      return pubsub.subscribe(`comment ${postId}`);
    }
  },
  post: {
    subscribe: (_, __, { pubsub }) => {
      return pubsub.subscribe('post');
    }
  }
};
