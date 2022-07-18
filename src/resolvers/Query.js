import { GraphQLYogaError } from '@graphql-yoga/node';
import prisma from '../prisma'; //Because I'm loosing all context if I access it by ctx
import getUserId from '../utils/getUserId';

const Query = {
  hello: (_, __, { pubsub }) => {
    // console.log(request);
    // getUserId(request);

    pubsub.publish('hello', { hello: 'Hello subscription ran' });
    return 'Hello There!';
  },
  users: async (_, args, { prismaSelect }, info) => {
    const select = prismaSelect(info);
    const take = args.take;
    const skip = args.skip;

    if (!args.query)
      return await prisma.user.findMany({
        take,
        orderBy: { createdAt: 'desc' },
        ...select,
        skip
      });

    return await prisma.user.findMany({
      where: {
        name: {
          contains: args.query,
          mode: 'insensitive'
        }
      },
      ...select,
      orderBy: { createdAt: 'desc' },
      take,
      skip
    });
  },

  posts: async (_, args, { prismaSelect }, info) => {
    const select = prismaSelect(info);

    if (!args.query)
      return await prisma.post.findMany({
        where: { published: { equals: true } },
        ...select,
        orderBy: { createdAt: 'desc' },
        take: args.take,
        skip: args.skip
      });

    return await prisma.post.findMany({
      where: {
        AND: [
          {
            published: { equals: true }
          },
          {
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
          }
        ]
      },
      ...select,
      orderBy: { createdAt: 'desc' },
      take: args.take,
      skip: args.skip
    });
  },

  myPosts: async (_, { query, take, skip }, { prismaSelect, request }, info) => {
    const userId = getUserId(request);
    const select = prismaSelect(info);

    const posts = await prisma.post.findMany({
      where: {
        AND: [
          {
            author: {
              id: { equals: userId }
            }
          },
          {
            OR: [
              {
                title: {
                  contains: query,
                  mode: 'insensitive'
                }
              },
              {
                body: {
                  contains: query,
                  mode: 'insensitive'
                }
              }
            ]
          }
        ]
      },
      ...select,
      orderBy: { createdAt: 'desc' },
      take,
      skip
    });

    return posts;
  },

  comments: async (_, { take, skip }, { prismaSelect }, info) => {
    const select = prismaSelect(info);

    return await prisma.comment.findMany({ ...select, orderBy: { createdAt: 'desc' }, take, skip });
  },

  me: async (_, __, { prismaSelect, request }, info) => {
    const userId = getUserId(request);
    const select = prismaSelect(info);

    return await prisma.user.findUnique({ where: { id: userId }, ...select });
  },

  post: async (_, { id }, { prismaSelect, request }, info) => {
    const userId = getUserId(request, false);

    const select = prismaSelect(info);

    const post = await prisma.post.findFirst({
      where: {
        AND: [
          {
            id: { equals: id }
          },
          {
            OR: [
              {
                published: { equals: true }
              },
              {
                author: {
                  id: { equals: userId }
                }
              }
            ]
          }
        ]
      },
      ...select
    });

    if (!post) {
      throw new GraphQLYogaError('Unable to read post!');
    }

    return post;
  }
};
export { Query as default };
