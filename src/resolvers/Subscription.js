export default {
  count: {
    subscribe: (_, __, { pubsub }) => {
      let count = 0;

      setInterval(() => {
        count++;
        pubsub.publish('count', {
          count
        });
      }, 2000);

      return pubsub.subscribe('count');
    }
  },
  comment: {
    subscribe: (_, { postId }, { db, pubsub }) => {
      const post = db.posts.find(post => post.id === postId && post.published);
      let count = 0;
      if (!post) throw new Error('No post found');

      return pubsub.subscribe(`comment ${postId}`);
    }
  }
};
