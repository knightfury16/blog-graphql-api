import prisma from '../prisma'; //Because I'm loosing all context if I access it by ctx
import getUserId from '../utils/getUserId';

const Query = {
  users: async (_, args, { db, prismaSelect }, info) => {
    const select = prismaSelect(info);

    if (!args.query)
      return await prisma.user.findMany({
        ...select
      });

    return await prisma.user.findMany({
      where: {
        OR: [
          {
            name: {
              contains: args.query,
              mode: 'insensitive'
            }
          },
          {
            email: {
              contains: args.query,
              mode: 'insensitive'
            }
          }
        ]
      },
      ...select
    });
  },

  posts: async (parent, args, { prismaSelect }, info) => {
    const select = prismaSelect(info);
    if (!args.query) return await prisma.post.findMany({ ...select });

    return await prisma.post.findMany({
      where: {
        OR: [
          {
            title: {
              contains: args.query,
              mode: 'insensitive'
            }
          },
          {
            body: {
              contains: args.query,
              mode: 'insensitive'
            }
          }
        ]
      },
      ...select
    });
  },
  comments: async (_, __, { prismaSelect }, info) => {
    const select = prismaSelect(info);

    return await prisma.comment.findMany({ ...select });
  },

  me: async (_, __, { prismaSelect, request }, info) => {
    const userId = getUserId(request);
    const select = prismaSelect(info);

    return await prisma.user.findUnique({ where: { id: userId }, ...select });
  }
};
export { Query as default };
