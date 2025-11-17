
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash the password
  const hashedPassword = await bcrypt.hash('teste123', 10);

  // Create test user
  const user = await prisma.user.upsert({
    where: { email: 'hello@ruptureculture.com' },
    update: {},
    create: {
      email: 'hello@ruptureculture.com',
      password: hashedPassword,
      name: 'Test User',
    },
  });

  console.log('✅ Test user created:', user.email);

  // Create default app settings if not exists
  const settings = await prisma.appSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      highlightContext: 'interview with company about needs and opportunities',
    },
  });

  console.log('✅ App settings created');
  console.log('\n🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
