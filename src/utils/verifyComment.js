import prisma from '../prisma';

export default async (commentId, authorId) => {
  return !!(await prisma.comment.findFirst({
    where: {
      AND: [
        {
          id: {
            equals: commentId
          }
        },
        {
          author: {
            id: {
              equals: authorId
            }
          }
        }
      ]
    }
  }));
};
