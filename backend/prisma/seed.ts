import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as argon2 from 'argon2';
import 'dotenv/config';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create Default Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'default-org' },
    update: {},
    create: {
      name: 'Default Organization',
      slug: 'default-org',
    },
  });
  console.log(`✅ Organization created: ${org.name}`);

  // 2. Create Admin User
  const adminEmail = 'admin@enterprise.com';
  const hashedPassword = await argon2.hash('Admin@123456');

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: hashedPassword,
    },
    create: {
      email: adminEmail,
      passwordHash: hashedPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: 'ADMIN',
      orgId: org.id,
      isActive: true,
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // 3. Create Default Dashboard Widgets for Admin
  const widgetCount = await prisma.widget.count({ where: { userId: admin.id } });
  if (widgetCount === 0) {
    await prisma.widget.createMany({
      data: [
        {
          userId: admin.id,
          type: 'TASKS_SUMMARY',
          positionX: 0,
          positionY: 0,
          width: 6,
          height: 4,
          config: {},
        },
        {
          userId: admin.id,
          type: 'CRM_PIPELINE',
          positionX: 6,
          positionY: 0,
          width: 6,
          height: 4,
          config: {},
        },
      ],
    });
    console.log('✅ Default widgets created.');
  }

  console.log('🏁 Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
