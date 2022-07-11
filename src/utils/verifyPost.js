import prisma from '../prisma';

export default async (postId, authorId) => {
  return !!(await prisma.post.findFirst({
    where: {
      AND: [
        {
          id: {
            equals: postId
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
