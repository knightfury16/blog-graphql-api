const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient({
  log: ['query']
});

async function main() {
  for (let index = 0; index < 20; index++) {
    await prisma.user.create({
      data: {
        name: faker.name.findName(),
        email: faker.internet.email(),
        password: faker.random.alphaNumeric(5),
        posts: {
          create: {
            title: faker.animal.bear(),
            body: faker.lorem.paragraphs(5),
            published: faker.datatype.boolean()
          }
        }
      }
    });
  }

  // ... you will write your Prisma Client queries here
  const users = await prisma.user.findMany({});
  const posts = await prisma.post.findMany();

  for (let index = 0; index < 10; index++) {
    const user = users[faker.datatype.number({ max: 9 })];
    const post = posts[faker.datatype.number({ max: 9 })];

    await prisma.comment.create({
      data: {
        text: faker.lorem.sentence(),
        author: {
          connect: {
            id: user.id
          }
        },
        post: {
          connect: {
            id: post.id
          }
        }
      }
    });
  }
  const comments = await prisma.comment.findMany();
  console.dir(comments, { depth: null });
  // console.log(user);
}

main()
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
