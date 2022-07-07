import prisma from '../prisma';
export default {
  author: async (parent, args, { db }, info) => {
    return await prisma.user.findFirst({
      where: {
        id: {
          equals: parent.userId
        }
      }
    });
  },
  comments: (parent, _, { db }) => {
    return db.comments.filter(comment => comment.post === parent.id);
  }
};
