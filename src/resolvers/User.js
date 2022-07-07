import prisma from '../prisma';
export default {
  posts: async (parent, _, { db }) => {
    const posts = await prisma.post.findMany({
      where: {
        author: {
          id: {
            equals: parent.id
          }
        }
      }
    });
    return posts;
  },
  comments: (parent, _, { db }) => {
    return db.comments.filter(comment => comment.author === parent.id);
  }
};
