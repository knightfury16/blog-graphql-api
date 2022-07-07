import prisma from '../prisma'; //Because I'm loosing all context if I access it by ctx

const Query = {
  users: async (_, args, { db }, info) => {
    if (!args.query) return await prisma.user.findMany();

    return await prisma.user.findMany({
      where: {
        name: {
          contains: args.query,
          mode: 'insensitive'
        }
      }
    });
  },

  posts: (parent, args, { db }, info) => {
    if (!args.query) return db.posts;

    return db.posts.filter(post => {
      const isTitleMtch = post.title.toLowerCase().includes(args.query.toLowerCase());
      const isBodyMtch = post.body.toLowerCase().includes(args.query.toLowerCase());
      return isTitleMtch || isBodyMtch;
    });
  },
  comments: (_, __, { db }) => {
    return db.comments;
  },
  me: () => ({
    id: 'abc123',
    name: 'Mike',
    email: 'mike@gmail.com',
    age: 22
  }),
  post: () => ({
    id: 'abc456',
    title: 'My first blog',
    body: 'Body of my first blog',
    published: true
  })
};
export { Query as default };
