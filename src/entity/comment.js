import prisma from '../prisma';
import getUserId from '../utils/getUserId';
import verifyComment from '../utils/verifyComment';

export default {
  createComment: async (_, { data }, { prismaSelect, request }, info) => {
    const userId = getUserId(request);
    const select = prismaSelect(info);

    const post = await prisma.post.findUnique({ where: { id: data.post } });
    if (!post.published) {
      throw new Error('Can not comment');
    }

    const comment = await prisma.comment.create({
      data: {
        text: data.text,
        author: {
          connect: {
            id: userId
          }
        },
        post: {
          connect: {
            id: data.post
          }
        }
      },
      ...select
    });

    return comment;
  },

  deleteComment: async (_, args, { prismaSelect, request }, info) => {
    try {
      const userId = getUserId(request);
      if (!(await verifyComment(args.id, userId))) {
        throw new Error('Unable to delete');
      }

      const select = prismaSelect(info);
      const comment = await prisma.comment.delete({ where: { id: args.id }, ...select });
      return comment;
    } catch (error) {
      if (error.code === 'P2025') throw new Error('Comment not found.');
      throw new Error(error);
    }
  },
  updateComment: async (_, { id, data }, { prismaSelect, request }, info) => {
    const userId = getUserId(request);
    if (!(await verifyComment(id, userId))) {
      throw new Error('Unable to update');
    }
    const select = prismaSelect(info);
    const comment = await prisma.comment.update({ where: { id: id }, data, ...select });

    return comment;
  }
};
