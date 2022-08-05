import prisma from '../prisma';
import getUserId from '../utils/getUserId';
import verifyPost from '../utils/verifyPost';

export default {
  createPost: async (_, { data }, { prismaSelect, request }, info) => {
    const userId = getUserId(request);

    const select = prismaSelect(info);
    const userExits = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userExits) throw new Error('User Not Found!');

    const post = await prisma.post.create({
      data: {
        title: data.title,
        body: data.body,
        published: data.published,
        author: {
          connect: {
            id: userId
          }
        }
      },
      ...select
    });

    return post;
  },
  deletePost: async (_, args, { prismaSelect, request }, info) => {
    try {
      // get the user id from jwt token
      const userId = getUserId(request);

      // verify if the post i created by user or not
      if (!(await verifyPost(args.id, userId))) throw new Error('Unable to delete post.');

      // proceed to delete the post
      const select = prismaSelect(info);
      const post = await prisma.post.delete({ where: { id: args.id }, ...select });

      return post;
    } catch (error) {
      if (error.code === 'P2025') throw new Error('Post not found.');
      throw new Error(error);
    }
  },
  updatePost: async (_, { id, data }, { prismaSelect, request }, info) => {
    try {
      const userId = getUserId(request);
      if (!(await verifyPost(id, userId))) {
        throw new Error('Unable to update post.');
      }

      if (typeof data.published === 'boolean' && !data.published) {
        await prisma.comment.deleteMany({ where: { postId: id } });
      }

      const select = prismaSelect(info);
      return await prisma.post.update({ where: { id: id }, data, ...select });
    } catch (error) {
      if (error.code === 'P2025') throw new Error('Post not found.');
      throw new Error(error);
    }
  }
};
