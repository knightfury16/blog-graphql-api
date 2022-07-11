import { GraphQLYogaError } from '@graphql-yoga/node';
import prisma from '../prisma';
import getUserId from '../utils/getUserId';
import verifyComment from '../utils/verifyComment';

export default {
  createComment: async (_, { data }, { prismaSelect, pubsub, request }, info) => {
    const userId = getUserId(request);
    const select = prismaSelect(info);

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

    pubsub.publish(`comment ${data.post}`, {
      comment: {
        mutation: 'CREATED',
        data: comment
      }
    });

    return comment;
  },

  deleteComment: async (_, args, { prismaSelect, pubsub, request }, info) => {
    try {
      const userId = getUserId(request);
      if (!(await verifyComment(args.id, userId))) {
        throw new GraphQLYogaError('Unable to delete');
      }

      const select = prismaSelect(info);
      const comment = await prisma.comment.delete({ where: { id: args.id }, ...select });
      pubsub.publish(`comment ${comment.postId}`, {
        comment: {
          mutation: 'DELETED',
          data: comment
        }
      });
      return comment;
    } catch (error) {
      if (error.code === 'P2025') throw new GraphQLYogaError('Comment not found.');
      throw new GraphQLYogaError(error);
    }
  },
  updateComment: async (_, { id, data }, { prismaSelect, pubsub, request }, info) => {
    const userId = getUserId(request);
    if (!(await verifyComment(id, userId))) {
      throw new GraphQLYogaError('Unable to update');
    }
    const select = prismaSelect(info);
    const comment = await prisma.comment.update({ where: { id: id }, data, ...select });

    pubsub.publish(`comment ${comment.postId}`, {
      comment: {
        mutation: 'Updated',
        data: comment
      }
    });
    return comment;
  }
};
