import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const user = {
    email: 'arya@stark.com',
    password: await argon2.hash('winteriscoming'),
    name: 'Aray Stark',
    role: Role.ADMIN,
  };
  const { email } = user;

  await prisma.user.upsert({
    where: { email },
    update: user,
    create: user,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
