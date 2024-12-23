import { PrismaClient } from '@prisma/client';
import { mockUsers } from './mock';

const prisma = new PrismaClient();

async function main() {
  const tableOrder = ['User'];

  for (const table of tableOrder) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
  }

  console.log('Seeding started...');

  // User 데이터 삽입
  await prisma.$transaction(async (tx) => {
    for (const user of mockUsers) {
      await tx.user.create({ data: user });
    }
  });

  // createMany 사용시 성능이 더 좋음음
  // await prisma.user.createMany({
  //   data: mockUsers,
  // });

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
