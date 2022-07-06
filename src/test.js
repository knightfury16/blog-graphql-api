const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // ... you will write your Prisma Client queries here
  // const user = await prisma.user.findMany({
  //   include: {
  //     posts: true
  //   }
  // });

  const post = await prisma.post.update({
    where: {
      id: '653d72e4-5e34-4716-9b88-2d1385264fd8'
    },
    data: {
      title: 'Updating my first post'
    }
  });

  // const post = await prisma.post.create({
  //   data: {
  //     title: 'My first post',
  //     body: 'Body of my first post',
  //     author: {
  //       connect: {
  //         id: '69dce6eb-a65f-48b8-86da-efd0149e28b3'
  //       }
  //     }
  //   }
  // });
  console.dir(post, { depth: null });
  // console.log(user);
}

main()
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
