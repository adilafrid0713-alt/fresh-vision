import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.user.findFirst();
    console.log('ok');
  } catch (error) {
    console.error('Failed to connect to the database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
