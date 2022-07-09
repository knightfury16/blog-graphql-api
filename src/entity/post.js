import { GraphQLYogaError } from '@graphql-yoga/node';
import prisma from '../prisma';

export default {
  createPost: async (parent, { data }, { prismaSelect, pubsub }, info) => {
    const select = prismaSelect(info);
    const userExits = await prisma.user.findUnique({
      where: { id: data.author }
    });

    if (!userExits) throw new GraphQLYogaError('User Not Found!');

    const post = await prisma.post.create({
      data: {
        title: data.title,
        body: data.body,
        published: data.published,
        author: {
          connect: {
            id: data.author
          }
        }
      },
      ...select
    });

    if (post.published)
      pubsub.publish('post', {
        post: {
          mutation: 'CREATED',
          data: post
        }
      });

    return post;
  },
  deletePost: async (_, args, { prismaSelect, pubsub }, info) => {
    try {
      const select = prismaSelect(info);
      const post = await prisma.post.delete({ where: { id: args.id }, ...select });

      if (post.published) {
        pubsub.publish('post', {
          post: {
            mutation: 'DELETED',
            data: post
          }
        });
      }
      return post;
    } catch (error) {
      if (error.code === 'P2025') throw new GraphQLYogaError('Post not found.');
      throw new GraphQLYogaError('Error3!!');
    }
  },
  updatePost: async (_, { id, data }, { prismaSelect, pubsub }, info) => {
    try {
      const select = prismaSelect(info);
      const post = await prisma.post.update({ where: { id: id }, data, ...select });
      return post;
    } catch (error) {
      if (error.code === 'P2025') throw new GraphQLYogaError('Post not found.');
      throw new GraphQLYogaError('Error5!!');
    }
  }
};
