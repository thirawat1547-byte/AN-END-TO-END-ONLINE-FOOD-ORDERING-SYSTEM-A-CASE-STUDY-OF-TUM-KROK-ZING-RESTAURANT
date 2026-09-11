// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 กำลังเริ่มต้นใส่ข้อมูลทดสอบ (Database Seeding)...');

  // 1. Seed ข้อมูล Admin User (Password: admin1234)
  const existingAdmin = await prisma.user.findFirst({
    where: { username: 'admin' },
  });

  if (!existingAdmin) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin1234', saltRounds);

    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        email: 'admin@tumkrokzing.com',
        phone_number: '0812345678',
        role: 'ADMIN',
      },
    });
    console.log(`✅ สร้างผู้ดูแลระบบสำเร็จ: ${admin.username} (Role: ${admin.role})`);
  } else {
    console.log('ℹ️ พบบัญชี Admin ในระบบแล้ว ข้ามขั้นตอนนี้');
  }

  // 2. Seed ข้อมูลโต๊ะภายในร้าน (Tables)
  const tables = [
    { table_number: 'T-01', capacity: 2, status: 'AVAILABLE' },
    { table_number: 'T-02', capacity: 4, status: 'AVAILABLE' },
    { table_number: 'T-03', capacity: 4, status: 'AVAILABLE' },
    { table_number: 'T-04', capacity: 6, status: 'AVAILABLE' },
    { table_number: 'T-05', capacity: 8, status: 'AVAILABLE' },
  ];

  for (const table of tables) {
    const existingTable = await prisma.table.findFirst({
      where: { table_number: table.table_number },
    });

    if (!existingTable) {
      await prisma.table.create({
        data: table,
      });
    }
  }
  console.log(`✅ เตรียมข้อมูลโต๊ะทดสอบเรียบร้อยแล้ว (${tables.length} โต๊ะ)`);

  console.log('🎉 Seeding ข้อมูลพื้นฐานเสร็จสิ้นสมบูรณ์!');
}

main()
  .catch((e) => {
    console.error('❌ เกิดข้อผิดพลาดระหว่างรัน Seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });