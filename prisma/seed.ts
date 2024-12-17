import { PrismaClient } from '@prisma/client';
import { mockUsers } from './mock';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding started...');

  // User 데이터 삽입
  await prisma.user.createMany({
    data: mockUsers,
  });
  console.log('Users seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
