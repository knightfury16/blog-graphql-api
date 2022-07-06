const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // ... you will write your Prisma Client queries here
  await prisma.user.create({
    data: {
      email: 'suhaib@gmail.com',
      name: 'Suhaib Ahmed',
      posts: {
        create: {
          title: 'my first blog post',
          content: 'this is how you make api',
          published: true
        }
      },
      profile: {
        create: {
          bio: 'i like turtle'
        }
      }
    }
  });

  const allUser = await prisma.user.findMany({
    include: {
      posts: true,
      profile: true
    }
  });

  console.log(allUser);
}

main()
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
