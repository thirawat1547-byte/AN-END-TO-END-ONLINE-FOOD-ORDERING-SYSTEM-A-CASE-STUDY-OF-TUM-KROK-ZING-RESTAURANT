"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 กำลังเริ่มต้นใส่ข้อมูลทดสอบ (Database Seeding)...');
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
    }
    else {
        console.log('ℹ️ พบบัญชี Admin ในระบบแล้ว ข้ามขั้นตอนนี้');
    }
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
//# sourceMappingURL=seed.js.map