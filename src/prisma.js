const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query']
});

export { prisma as default };
