import { GraphQLYogaError } from '@graphql-yoga/node';
import prisma from '../prisma';

export default {
  createComment: async (_, { data }, { prismaSelect, pubsub }, info) => {
    const select = prismaSelect(info);
    const user = await prisma.user.findUnique({ where: { id: data.author } });
    if (!user) throw new GraphQLYogaError('User not found!');

    const post = await prisma.post.findUnique({ where: { id: data.post } });
    if (!post) throw new GraphQLYogaError('Post not found!');

    if (!post.published) throw new GraphQLYogaError('Post not published!');

    const comment = await prisma.comment.create({
      data: {
        text: data.text,
        author: {
          connect: {
            id: data.author
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
  deleteComment: async (_, args, { prismaSelect, pubsub }, info) => {
    try {
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
      throw new GraphQLYogaError('Error4!!');
    }
  },
  updateComment: async (_, { id, data }, { prismaSelect, pubsub }, info) => {
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
