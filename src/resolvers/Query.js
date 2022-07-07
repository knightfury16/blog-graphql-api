import prisma from '../prisma'; //Because I'm loosing all context if I access it by ctx
import { PrismaSelect } from '@paljs/plugins';

const Query = {
  users: async (_, args, { db }, info) => {
    const select = new PrismaSelect(info).value;

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

  posts: async (parent, args, { db }, info) => {
    const select = new PrismaSelect(info).value;

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
  comments: async (_, __, { db }, info) => {
    const select = new PrismaSelect(info).value;

    return await prisma.comment.findMany({ ...select });
  },

  me: () => ({
    id: 'abc123',
    name: 'Mike',
    email: 'mike@gmail.com',
    age: 22
  }),
  post: () => ({
    id: 'abc456',
    title: 'My first blog',
    body: 'Body of my first blog',
    published: true
  })
};
export { Query as default };
