export default {
  comment: {
    subscribe: (_, { postId }, { db, pubsub }) => {
      const post = db.posts.find(post => post.id === postId && post.published);
      let count = 0;
      if (!post) throw new GraphQLYogaError('No post found');

      return pubsub.asyncIterator(`comment ${postId}`);
    }
  },
  post: {
    subscribe: (_, __, { pubsub }) => {
      //   console.log('Im here');
      // console.log('CONTEXT FROM POST SUB:', ctx);
      return pubsub.asyncIterator('post');
    }
  }
};
