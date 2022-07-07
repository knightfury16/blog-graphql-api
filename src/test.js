const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient({
  log: ['query']
});

async function main() {
  // for (let index = 0; index < 10; index++) {
  //   await prisma.user.create({
  //     data: {
  //       name: faker.name.findName(),
  //       email: faker.internet.email(),
  //       posts: {
  //         create: {
  //           title: faker.animal.bear(),
  //           body: faker.fake(
  //             'I flipped the coin an got: {{helpers.arrayElement(["heads", "tails"])}}'
  //           ),
  //           published: faker.datatype.boolean()
  //         }
  //       }
  //     }
  //   });
  // }

  // ... you will write your Prisma Client queries here
  const user = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      posts: { select: { id: true, title: true } }
    }
  });

  // const user = await prisma.user.delete({
  //   where: {
  //     id: '69dce6eb-a65f-48b8-86da-efd0149e28b3'
  //   }
  // });
  // const post = await prisma.post.update({
  //   where: {
  //     id: '653d72e4-5e34-4716-9b88-2d1385264fd8'
  //   },
  //   data: {
  //     title: 'Updating my first post'
  //   }
  // });

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
  console.dir(user, { depth: null });
  // console.log(user);
}

main()
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
