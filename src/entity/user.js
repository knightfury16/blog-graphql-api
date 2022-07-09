import { GraphQLYogaError } from '@graphql-yoga/node';
import prisma from '../prisma';

export default {
  createUser: async (parent, args, { prismaSelect }, info) => {
    const select = prismaSelect(info);

    return await prisma.user.create({ data: args.data, ...select });
  },
  deleteUser: async (_, args, { prismaSelect }, info) => {
    const select = prismaSelect(info);
    return await prisma.user.delete({
      where: {
        id: args.id
      },
      ...select
    });
  },
  updateUser: async (parent, args, { prismaSelect }, info) => {
    const select = prismaSelect(info);
    const { id, data } = args;
    return await prisma.user.update({ where: { id }, data: { ...data }, ...select });
  }
};
