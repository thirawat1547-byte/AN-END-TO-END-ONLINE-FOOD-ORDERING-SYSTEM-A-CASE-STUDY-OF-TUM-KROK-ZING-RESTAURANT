// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 กำลังเริ่มต้นใส่ข้อมูลทดสอบ (Database Seeding)...');

  // 1. Seed ข้อมูลผู้ใช้งานตาม Role
  // 1.1 Admin User (Password: admin1234)
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

  // 1.2 Kitchen User (Password: kitchen1234)
  const existingKitchen = await prisma.user.findFirst({
    where: { username: 'kitchen' },
  });

  if (!existingKitchen) {
    const hashedPassword = await bcrypt.hash('kitchen1234', 10);
    const kitchen = await prisma.user.create({
      data: {
        username: 'kitchen',
        password: hashedPassword,
        email: 'kitchen@tumkrokzing.com',
        phone_number: '0899998888',
        role: 'KITCHEN',
      },
    });
    console.log(`✅ สร้างพนักงานห้องครัวสำเร็จ: ${kitchen.username} (Role: ${kitchen.role})`);
  }

  // 1.3 Customer User (Password: password123)
  const existingCustomer = await prisma.user.findFirst({
    where: { username: 'somchai' },
  });

  if (!existingCustomer) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const customer = await prisma.user.create({
      data: {
        username: 'somchai',
        password: hashedPassword,
        email: 'somchai@example.com',
        phone_number: '0811112222',
        address: 'ตลาดปากเกร็ด นนทบุรี',
        role: 'CUSTOMER',
      },
    });
    console.log(`✅ สร้างสมาชิกลูกค้าสำเร็จ: ${customer.username} (Role: ${customer.role})`);
  }

  // 1.4 Rider User (Password: rider1234)
  const existingRider = await prisma.user.findFirst({
    where: { username: 'rider' },
  });

  if (!existingRider) {
    const hashedPassword = await bcrypt.hash('rider1234', 10);
    const rider = await prisma.user.create({
      data: {
        username: 'rider',
        password: hashedPassword,
        email: 'rider@tumkrokzing.com',
        phone_number: '0877776666',
        address: 'ประจำร้านตำครกซิ่ง',
        role: 'RIDER',
      },
    });
    console.log(`✅ สร้างพนักงานจัดส่ง (ไรเดอร์) สำเร็จ: ${rider.username} (Role: ${rider.role})`);
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

  // 3. Seed หมวดหมู่ (Categories)
  const categories = [
    { category_id: 1, category_name: 'อาหารจานเดียว / ผัด' },
    { category_id: 2, category_name: 'ส้มตำแซ่บซิ่ง' },
    { category_id: 3, category_name: 'ลาบ / ยำ' },
    { category_id: 4, category_name: 'ของทอด' },
    { category_id: 5, category_name: 'เครื่องดื่ม' },
  ];

  for (const cat of categories) {
    const existingCat = await prisma.category.findUnique({
      where: { category_id: cat.category_id },
    });
    if (!existingCat) {
      await prisma.category.create({
        data: cat,
      });
    }
  }
  console.log(`✅ เตรียมหมวดหมู่อาหารเรียบร้อยแล้ว (${categories.length} หมวดหมู่)`);

  // 4. Seed รายการอาหาร (Menus)
  const menus = [
    {
      category_id: 1,
      menu_name: 'กะเพราหมู',
      description: 'หอมฟุ้ง อร่อยเด็ดสะใจ!',
      price: 40.00,
      image_url: '/images/kapaomu.jpg',
      calories: 450,
      is_available: true,
    },
    {
      category_id: 1,
      menu_name: 'กะเพราทะเล/หมึก/กุ้ง',
      description: 'จัดจ้าน กุ้งหมึกสดใหม่',
      price: 60.00,
      image_url: '/images/kapaotaley.jpg',
      calories: 480,
      is_available: true,
    },
    {
      category_id: 1,
      menu_name: 'ข้าวผัดหมู',
      description: 'ข้าวเม็ดสวย ผัดหอมกระทะ',
      price: 40.00,
      image_url: '/images/khaopadmu.jpg',
      calories: 520,
      is_available: true,
    },
    {
      category_id: 1,
      menu_name: 'ข้าวผัดทะเล/หมึก/กุ้ง',
      description: 'เครื่องแน่น กุ้งเด้ง หมึกสด',
      price: 60.00,
      image_url: '/images/khaopadtalay.jpg',
      calories: 550,
      is_available: true,
    },
    {
      category_id: 2,
      menu_name: 'ส้มตำปูปลาร้า',
      description: 'เส้นมะละกอดิบ มะเขือเทศ และพริก ปลาร้านัวแท้',
      price: 40.00,
      image_url: '/images/tumprara.jpg',
      calories: 120,
      is_available: true,
    },
    {
      category_id: 2,
      menu_name: 'ส้มตำไทย',
      description: 'รสเปรี้ยวหวาน ถั่วลิสงคั่วเอง กุ้งแห้งตัวโต',
      price: 40.00,
      image_url: '/images/tumtai.jpg',
      calories: 150,
      is_available: true,
    },
    {
      category_id: 3,
      menu_name: 'ลาบหมู',
      description: 'หมูสับนุ่ม ข้าวคั่วหอมกรุ่น พริกป่นคั่วเอง',
      price: 50.00,
      image_url: '/images/larbmoo.jpg',
      calories: 250,
      is_available: true,
    },
    {
      category_id: 3,
      menu_name: 'ยำวุ้นเส้นทะเล',
      description: 'เปรี้ยวเผ็ดแซ่บ กุ้ง หมึก หมูสับ',
      price: 70.00,
      image_url: '/images/yumtalay.jpg',
      calories: 320,
      is_available: true,
    },
    {
      category_id: 4,
      menu_name: 'ไก่ทอด (สะโพก)',
      description: 'เนื้อฉ่ำๆ ชิ้นใหญ่ กรอบนอกนุ่มใน',
      price: 50.00,
      image_url: '/images/chick.jpg',
      calories: 380,
      is_available: true,
    },
    {
      category_id: 4,
      menu_name: 'ปีกไก่ทอด',
      description: 'ปีกไก่หมักซอสทอดกรอบ ร้อนๆ เสิร์ฟพร้อมน้ำจิ้มแจ่ว',
      price: 50.00,
      image_url: '/images/wingchick.jpg',
      calories: 350,
      is_available: true,
    },
    {
      category_id: 5,
      menu_name: 'โค้ก (กระป๋อง)',
      description: 'เครื่องดื่มเย็นสดชื่น',
      price: 20.00,
      image_url: '/images/coke.jpg',
      calories: 140,
      is_available: true,
    },
    {
      category_id: 5,
      menu_name: 'น้ำดื่ม',
      description: 'น้ำดื่มสะอาด ตราตำครกซิ่ง',
      price: 10.00,
      image_url: '/images/water.jpg',
      calories: 0,
      is_available: true,
    },
  ];

  for (const m of menus) {
    const existingMenu = await prisma.menu.findFirst({
      where: { menu_name: m.menu_name },
    });
    if (!existingMenu) {
      await prisma.menu.create({
        data: m,
      });
    }
  }
  console.log(`✅ เตรียมรายการอาหารเรียบร้อยแล้ว (${menus.length} รายการ)`);

  // 5. Seed วัตถุดิบ (Ingredients)
  const ingredients = [
    { name: 'หมูสด / หมูสับ', quantity: 20.0, unit: 'กก.', min_quantity: 5.0 },
    { name: 'กุ้ง / หมึกสด', quantity: 15.0, unit: 'กก.', min_quantity: 3.0 },
    { name: 'เนื้อไก่สด', quantity: 18.0, unit: 'กก.', min_quantity: 4.0 },
    { name: 'มะละกอดิบขูด', quantity: 25.0, unit: 'กก.', min_quantity: 5.0 },
    { name: 'พริกสดจินดาแดง', quantity: 8.0, unit: 'กก.', min_quantity: 2.0 },
    { name: 'น้ำปลาร้าปรุงสุก', quantity: 15.0, unit: 'ขวด', min_quantity: 3.0 },
    { name: 'ข้าวสารหอมมะลิ', quantity: 30.0, unit: 'กก.', min_quantity: 5.0 },
    { name: 'ใบกะเพราสด', quantity: 5.0, unit: 'กก.', min_quantity: 1.0 },
    { name: 'ปูเค็ม/ปูดอง', quantity: 10.0, unit: 'กก.', min_quantity: 2.0 },
  ];

  for (const ing of ingredients) {
    const existingIng = await prisma.ingredient.findFirst({
      where: { name: ing.name },
    });
    if (!existingIng) {
      await prisma.ingredient.create({
        data: ing,
      });
    }
  }
  console.log(`✅ เตรียมข้อมูลวัตถุดิบเรียบร้อยแล้ว (${ingredients.length} รายการ)`);

  // 6. Seed สูตรอาหาร (MenuIngredients)
  const allMenus = await prisma.menu.findMany();
  const allIngredients = await prisma.ingredient.findMany();

  const getMenuId = (name: string) => allMenus.find((m) => m.menu_name === name)?.menu_id;
  const getIngId = (name: string) => allIngredients.find((i) => i.name === name)?.ingredient_id;

  const recipes = [
    // กะเพราหมู
    { menuName: 'กะเพราหมู', ingName: 'หมูสด / หมูสับ', qty: 0.15 },
    { menuName: 'กะเพราหมู', ingName: 'ใบกะเพราสด', qty: 0.02 },
    { menuName: 'กะเพราหมู', ingName: 'พริกสดจินดาแดง', qty: 0.01 },
    { menuName: 'กะเพราหมู', ingName: 'ข้าวสารหอมมะลิ', qty: 0.10 },

    // กะเพราทะเล/หมึก/กุ้ง
    { menuName: 'กะเพราทะเล/หมึก/กุ้ง', ingName: 'กุ้ง / หมึกสด', qty: 0.15 },
    { menuName: 'กะเพราทะเล/หมึก/กุ้ง', ingName: 'ใบกะเพราสด', qty: 0.02 },
    { menuName: 'กะเพราทะเล/หมึก/กุ้ง', ingName: 'ข้าวสารหอมมะลิ', qty: 0.10 },

    // ข้าวผัดหมู
    { menuName: 'ข้าวผัดหมู', ingName: 'หมูสด / หมูสับ', qty: 0.10 },
    { menuName: 'ข้าวผัดหมู', ingName: 'ข้าวสารหอมมะลิ', qty: 0.15 },

    // ส้มตำปูปลาร้า
    { menuName: 'ส้มตำปูปลาร้า', ingName: 'มะละกอดิบขูด', qty: 0.20 },
    { menuName: 'ส้มตำปูปลาร้า', ingName: 'น้ำปลาร้าปรุงสุก', qty: 0.05 },
    { menuName: 'ส้มตำปูปลาร้า', ingName: 'พริกสดจินดาแดง', qty: 0.02 },
    { menuName: 'ส้มตำปูปลาร้า', ingName: 'ปูเค็ม/ปูดอง', qty: 0.05 },

    // ส้มตำไทย
    { menuName: 'ส้มตำไทย', ingName: 'มะละกอดิบขูด', qty: 0.20 },
    { menuName: 'ส้มตำไทย', ingName: 'พริกสดจินดาแดง', qty: 0.02 },

    // ลาบหมู
    { menuName: 'ลาบหมู', ingName: 'หมูสด / หมูสับ', qty: 0.15 },
    { menuName: 'ลาบหมู', ingName: 'พริกสดจินดาแดง', qty: 0.02 },

    // ไก่ทอด (สะโพก)
    { menuName: 'ไก่ทอด (สะโพก)', ingName: 'เนื้อไก่สด', qty: 0.25 },

    // ปีกไก่ทอด
    { menuName: 'ปีกไก่ทอด', ingName: 'เนื้อไก่สด', qty: 0.20 },
  ];

  for (const r of recipes) {
    const mId = getMenuId(r.menuName);
    const iId = getIngId(r.ingName);
    if (mId && iId) {
      const existingMI = await prisma.menuIngredient.findUnique({
        where: {
          menu_id_ingredient_id: {
            menu_id: mId,
            ingredient_id: iId,
          },
        },
      });
      if (!existingMI) {
        await prisma.menuIngredient.create({
          data: {
            menu_id: mId,
            ingredient_id: iId,
            quantity_used: r.qty,
          },
        });
      }
    }
  }
  console.log(`✅ เตรียมสูตรอาหารและการใช้วัตถุดิบเรียบร้อยแล้ว (${recipes.length} สูตร)`);

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