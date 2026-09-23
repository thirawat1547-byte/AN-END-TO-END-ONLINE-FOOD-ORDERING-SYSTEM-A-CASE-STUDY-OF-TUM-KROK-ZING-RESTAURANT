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
            description: 'กะเพราหมูสับผัดพริกแห้ง หอมฟุ้ง อร่อยเด็ดสะใจ',
            price: 40.00,
            image_url: '/images/kapaomu.jpg',
            calories: 450,
            is_available: true,
        },
        {
            category_id: 1,
            menu_name: 'กะเพราทะเล/หมึก/กุ้ง',
            description: 'กะเพราซีฟู้ดสดใหม่ กุ้งปลาหมึกเด้ง เผ็ดร้อน ถึงเครื่อง',
            price: 60.00,
            image_url: '/images/kapaotaley.jpg',
            calories: 480,
            is_available: true,
        },
        {
            category_id: 1,
            menu_name: 'ข้าวผัดหมู',
            description: 'ข้าวผัดหอมกรุ่นกระทะ เมล็ดข้าวร่วนสวย ใส่หมูนุ่ม',
            price: 40.00,
            image_url: '/images/khaopadmu.jpg',
            calories: 520,
            is_available: true,
        },
        {
            category_id: 1,
            menu_name: 'ข้าวผัดกุ้ง',
            description: 'ข้าวผัดกุ้งสดเด้ง รสชาติกลมกล่อม หอมกลิ่นกระทะ',
            price: 50.00,
            image_url: '/images/khaopadtalay.jpg',
            calories: 510,
            is_available: true,
        },
        {
            category_id: 1,
            menu_name: 'ข้าวผัดทะเล/หมึก/กุ้ง',
            description: 'รวมมิตรทะเลผัดข้าวหอมมะลิ รสชาติกลมกล่อม',
            price: 60.00,
            image_url: '/images/khaopadtalay.jpg',
            calories: 550,
            is_available: true,
        },
        {
            category_id: 1,
            menu_name: 'ผัดพริกแกงหมู',
            description: 'พริกแกงเข้มข้นถึงเครื่องแกงใต้ ผัดถั่วฝักยาวและหมูนุ่ม',
            price: 40.00,
            image_url: '/images/pikkangmu.jpg',
            calories: 460,
            is_available: true,
        },
        {
            category_id: 1,
            menu_name: 'ผัดพริกแกงทะเล/หมึก/กุ้ง',
            description: 'ผัดพริกแกงรวมมิตรทะเล รสชาติจัดจ้านถึงใจ',
            price: 60.00,
            image_url: '/images/prikkangtalay.jpg',
            calories: 480,
            is_available: true,
        },
        {
            category_id: 1,
            menu_name: 'ผัดคะน้าหมูกรอบ',
            description: 'คะน้าสดกรอบผัดหมูกรอบชิ้นโต รสชาติกลมกล่อมหอมน้ำมันหอย',
            price: 40.00,
            image_url: '/images/kanamokrop.jpg',
            calories: 490,
            is_available: true,
        },
        {
            category_id: 1,
            menu_name: 'ผัดคะน้าทะเล/หมึก/กุ้ง',
            description: 'คะน้าสดกรอบผัดซีฟู้ดเนื้อแน่น ปรุงร้อนๆ จานต่อจาน',
            price: 60.00,
            image_url: '/images/kanatalay.jpg',
            calories: 440,
            is_available: true,
        },
        {
            category_id: 1,
            menu_name: 'ข้าวหมูกระเทียม',
            description: 'หมูหมักนุ่มผัดกระเทียมพริกไทยดำหอมเตะจมูก',
            price: 40.00,
            image_url: '/images/mookratiem.jpg',
            calories: 470,
            is_available: true,
        },
        {
            category_id: 1,
            menu_name: 'ข้าวไข่เจียวหมูสับ',
            description: 'ไข่เจียวฟูกรอบนอกนุ่มใน หมูสับแน่นๆ ทอดร้อนๆ',
            price: 40.00,
            image_url: '/images/kaijeawmoosub.jpg',
            calories: 520,
            is_available: true,
        },
        {
            category_id: 1,
            menu_name: 'ข้าวไข่เจียวกุ้ง',
            description: 'ไข่เจียวฟูใส่กุ้งสดเด้ง ทานคู่น้ำปลาพริกมะนาว',
            price: 50.00,
            image_url: '/images/kaikung.jpg',
            calories: 500,
            is_available: true,
        },
        {
            category_id: 1,
            menu_name: 'ข้าวเปล่า',
            description: 'ข้าวสวยหอมมะลิหุงสุก ร้อนๆ นุ่มอร่อย',
            price: 10.00,
            image_url: '/images/kao.jpg',
            calories: 150,
            is_available: true,
        },
        {
            category_id: 2,
            menu_name: 'ส้มตำปูปลาร้า',
            description: 'เส้นมะละกอดิบ มะเขือเทศ และพริก ปลาร้านัวแท้สูตรเฉพาะ',
            price: 40.00,
            image_url: '/images/tumprara.jpg',
            calories: 120,
            is_available: true,
        },
        {
            category_id: 2,
            menu_name: 'ส้มตำไทย',
            description: 'รสเปรี้ยวหวาน ถั่วลิสงคั่วเอง กุ้งแห้งตัวโต มะนาวสดแท้',
            price: 40.00,
            image_url: '/images/tumtai.jpg',
            calories: 150,
            is_available: true,
        },
        {
            category_id: 2,
            menu_name: 'ข้าวเหนียว',
            description: 'ข้าวเหนียวนุ่ม ร้อนๆ หอมอร่อย ทานคู่กับส้มตำ ลาบ ไก่ทอด',
            price: 10.00,
            image_url: '/images/kaon.jpg',
            calories: 160,
            is_available: true,
        },
        {
            category_id: 3,
            menu_name: 'ลาบหมู',
            description: 'หมูสับนุ่ม ข้าวคั่วหอมกรุ่น พริกป่นคั่วเอง มะนาวแท้',
            price: 50.00,
            image_url: '/images/larbmoo.jpg',
            calories: 250,
            is_available: true,
        },
        {
            category_id: 3,
            menu_name: 'ยำวุ้นเส้นทะเล',
            description: 'เปรี้ยวเผ็ดแซ่บ กุ้ง หมึก หมูสับ วุ้นเส้นเหนียวนุ่ม',
            price: 70.00,
            image_url: '/images/yumtalay.jpg',
            calories: 320,
            is_available: true,
        },
        {
            category_id: 3,
            menu_name: 'น้ำตกหมู',
            description: 'หมูนุ่ม หอมมะนาว ข้าวคั่ว รสจัดจ้าน',
            price: 70.00,
            image_url: '/images/namtokmoo.jpg',
            calories: 200,
            is_available: true,
        },
        {
            category_id: 4,
            menu_name: 'ไก่ทอด (สะโพก)',
            description: 'เนื้อฉ่ำๆ ชิ้นใหญ่ กรอบนอกนุ่มใน ไม่อมน้ำมัน',
            price: 50.00,
            image_url: '/images/chick.jpg',
            calories: 380,
            is_available: true,
        },
        {
            category_id: 4,
            menu_name: 'ไก่ทอด (ปีก)',
            description: 'ปีกไก่หมักซอสทอดกรอบ ร้อนๆ เสิร์ฟพร้อมน้ำจิ้มแจ่ว',
            price: 50.00,
            image_url: '/images/wingchick.jpg',
            calories: 350,
            is_available: true,
        },
        {
            category_id: 5,
            menu_name: 'น้ำเก๊กฮวย',
            description: 'น้ำเก๊กฮวยต้มสมุนไพรแท้ หวานน้อย หอมเย็นชื่นใจ',
            price: 20.00,
            image_url: '/images/gek.jpg',
            calories: 90,
            is_available: true,
        },
        {
            category_id: 5,
            menu_name: 'โค้ก (กระป๋อง)',
            description: 'เครื่องดื่มน้ำอัดลมโค้ก เย็นซ่าสดชื่น',
            price: 20.00,
            image_url: '/images/coke.jpg',
            calories: 140,
            is_available: true,
        },
        {
            category_id: 5,
            menu_name: 'สไปรท์ (Sprite)',
            description: 'น้ำอัดลมกลิ่นเลมอนไลม์ ใสซ่า สดชื่นทันใจ',
            price: 20.00,
            image_url: '/images/sprite.jpg',
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
            where: {
                OR: [
                    { menu_name: m.menu_name },
                    { menu_name: m.menu_name.replace('กะเพรา', 'กระเพรา') },
                    { menu_name: m.menu_name.replace('กระเพรา', 'กะเพรา') },
                    { menu_name: m.menu_name.replace('ผัดคะน้าหมูกรอบ', 'ผัดคะน้าหมู') },
                    { menu_name: m.menu_name.replace('โค้ก (กระป๋อง)', 'โค้ก (Coke)') },
                    { menu_name: m.menu_name.replace('น้ำดื่ม', 'น้ำเปล่า') },
                    { menu_name: m.menu_name.replace('ไก่ทอด (ปีก)', 'ปีกไก่ทอด') },
                ],
            },
        });
        if (!existingMenu) {
            await prisma.menu.create({
                data: m,
            });
        }
    }
    console.log(`✅ เตรียมรายการอาหารเรียบร้อยแล้ว (${menus.length} รายการ)`);
    try {
        await prisma.ingredient.deleteMany({
            where: {
                OR: [
                    { name: 'กุ้งและหมึกสด' },
                    { name: { contains: 'กุ้งและหมึก' } },
                ],
            },
        });
    }
    catch (e) { }
    const ingredients = [
        { name: 'หมูสด / หมูสับ', quantity: 20.0, unit: 'กก.', min_quantity: 5.0 },
        { name: 'กุ้งสด', quantity: 15.0, unit: 'กก.', min_quantity: 3.0 },
        { name: 'หมึกสด', quantity: 15.0, unit: 'กก.', min_quantity: 3.0 },
        { name: 'หมูกรอบ', quantity: 10.0, unit: 'กก.', min_quantity: 3.0 },
        { name: 'เนื้อสะโพกไก่', quantity: 18.0, unit: 'กก.', min_quantity: 4.0 },
        { name: 'ปีกไก่สด', quantity: 15.0, unit: 'กก.', min_quantity: 4.0 },
        { name: 'มะละกอดิบขูด', quantity: 25.0, unit: 'กก.', min_quantity: 5.0 },
        { name: 'พริกสดจินดาแดง', quantity: 8.0, unit: 'กก.', min_quantity: 2.0 },
        { name: 'กระเทียมสด', quantity: 6.0, unit: 'กก.', min_quantity: 2.0 },
        { name: 'ผักคะน้าสด', quantity: 10.0, unit: 'กก.', min_quantity: 3.0 },
        { name: 'ใบกะเพราสด', quantity: 5.0, unit: 'กก.', min_quantity: 1.0 },
        { name: 'ถั่วฝักยาว', quantity: 8.0, unit: 'กก.', min_quantity: 2.0 },
        { name: 'มะเขือเทศสีดา', quantity: 8.0, unit: 'กก.', min_quantity: 2.0 },
        { name: 'มะนาวสด', quantity: 60.0, unit: 'ลูก', min_quantity: 15.0 },
        { name: 'ปูเค็ม/ปูดอง', quantity: 30.0, unit: 'ตัว', min_quantity: 10.0 },
        { name: 'น้ำปลาร้าปรุงสุก', quantity: 15.0, unit: 'ขวด', min_quantity: 3.0 },
        { name: 'ถั่วลิสงคั่วบด', quantity: 6.0, unit: 'กก.', min_quantity: 2.0 },
        { name: 'กุ้งแห้ง', quantity: 4.0, unit: 'กก.', min_quantity: 1.0 },
        { name: 'พริกแกงเผ็ด', quantity: 6.0, unit: 'กก.', min_quantity: 2.0 },
        { name: 'วุ้นเส้น', quantity: 30.0, unit: 'ห่อ', min_quantity: 10.0 },
        { name: 'ไข่ไก่สด', quantity: 120.0, unit: 'ฟอง', min_quantity: 30.0 },
        { name: 'ข้าวสารหอมมะลิ', quantity: 50.0, unit: 'กก.', min_quantity: 10.0 },
        { name: 'ข้าวเหนียว', quantity: 30.0, unit: 'กก.', min_quantity: 8.0 },
        { name: 'แป้งทอดกรอบ', quantity: 10.0, unit: 'กก.', min_quantity: 3.0 },
        { name: 'ข้าวคั่ว', quantity: 5.0, unit: 'กก.', min_quantity: 1.5 },
        { name: 'พริกป่น', quantity: 5.0, unit: 'กก.', min_quantity: 1.5 },
        { name: 'ดอกเก๊กฮวยอบแห้ง', quantity: 20.0, unit: 'ห่อ', min_quantity: 5.0 },
        { name: 'โค้กกระป๋อง', quantity: 100.0, unit: 'กระป๋อง', min_quantity: 20.0 },
        { name: 'สไปรท์กระป๋อง', quantity: 100.0, unit: 'กระป๋อง', min_quantity: 20.0 },
        { name: 'น้ำดื่มขวด', quantity: 100.0, unit: 'ขวด', min_quantity: 25.0 },
    ];
    for (const ing of ingredients) {
        const existingIng = await prisma.ingredient.findFirst({
            where: {
                OR: [
                    { name: ing.name },
                    { name: { contains: ing.name.split('/')[0].trim() } },
                ],
            },
        });
        if (!existingIng) {
            await prisma.ingredient.create({
                data: ing,
            });
        }
    }
    console.log(`✅ เตรียมข้อมูลวัตถุดิบเรียบร้อยแล้ว (${ingredients.length} รายการ)`);
    const allMenus = await prisma.menu.findMany();
    const allIngredients = await prisma.ingredient.findMany();
    const normalizeName = (str) => str.replace(/[\s\(\)\/\-\_]/g, '').replace(/กระเพรา/g, 'กะเพรา').toLowerCase();
    const getMenuIds = (name) => {
        const target = normalizeName(name);
        return allMenus
            .filter((m) => {
            const n = normalizeName(m.menu_name);
            return (n === target ||
                (target.includes('คะน้าหมู') && n.includes('คะน้าหมู')) ||
                ((target.includes('ไก่ทอดปีก') || target.includes('ปีกไก่ทอด')) &&
                    (n.includes('ไก่ทอดปีก') || n.includes('ปีกไก่ทอด'))) ||
                ((target.includes('ไก่ทอดสะโพก') || target.includes('สะโพกไก่ทอด')) &&
                    (n.includes('ไก่ทอดสะโพก') || n.includes('สะโพกไก่ทอด'))) ||
                (target.includes('โค้ก') && n.includes('โค้ก')) ||
                ((target.includes('น้ำดื่ม') || target.includes('น้ำเปล่า')) &&
                    (n.includes('น้ำดื่ม') || n.includes('น้ำเปล่า'))) ||
                n.includes(target) ||
                target.includes(n));
        })
            .map((m) => m.menu_id);
    };
    const getIngId = (name) => {
        const target = normalizeName(name);
        const exact = allIngredients.find((i) => normalizeName(i.name) === target);
        if (exact)
            return exact.ingredient_id;
        return allIngredients.find((i) => {
            const n = normalizeName(i.name);
            return ((target.includes('หมูสับ') && (n.includes('หมูสับ') || n.includes('หมูสด'))) ||
                (target.includes('กุ้งสด') && n.includes('กุ้งสด')) ||
                (target.includes('กุ้งแห้ง') && n.includes('กุ้งแห้ง')) ||
                (target.includes('หมึก') && n.includes('หมึก')) ||
                (target.includes('ไก่') && target.includes('สะโพก') && n.includes('สะโพก')) ||
                (target.includes('ไก่') && target.includes('ปีก') && n.includes('ปีก')) ||
                (target.includes('มะละกอ') && n.includes('มะละกอ')) ||
                (target.includes('ปู') && (n.includes('ปูเค็ม') || n.includes('ปูดอง'))) ||
                (target.includes('โค้ก') && n.includes('โค้ก')) ||
                (target.includes('สไปรท์') && n.includes('สไปรท์')) ||
                ((target.includes('น้ำดื่ม') || target.includes('น้ำเปล่า')) &&
                    (n.includes('น้ำดื่ม') || n.includes('น้ำเปล่า'))) ||
                n.includes(target) ||
                target.includes(n));
        })?.ingredient_id;
    };
    const recipes = [
        { menuName: 'กะเพราหมู', ingName: 'หมูสด / หมูสับ', qty: 0.15 },
        { menuName: 'กะเพราหมู', ingName: 'ใบกะเพราสด', qty: 0.02 },
        { menuName: 'กะเพราหมู', ingName: 'พริกสดจินดาแดง', qty: 0.01 },
        { menuName: 'กะเพราหมู', ingName: 'กระเทียมสด', qty: 0.01 },
        { menuName: 'กะเพราหมู', ingName: 'ข้าวสารหอมมะลิ', qty: 0.15 },
        { menuName: 'กะเพราทะเล/หมึก/กุ้ง', ingName: 'กุ้งสด', qty: 0.08 },
        { menuName: 'กะเพราทะเล/หมึก/กุ้ง', ingName: 'หมึกสด', qty: 0.07 },
        { menuName: 'กะเพราทะเล/หมึก/กุ้ง', ingName: 'ใบกะเพราสด', qty: 0.02 },
        { menuName: 'กะเพราทะเล/หมึก/กุ้ง', ingName: 'พริกสดจินดาแดง', qty: 0.01 },
        { menuName: 'กะเพราทะเล/หมึก/กุ้ง', ingName: 'กระเทียมสด', qty: 0.01 },
        { menuName: 'กะเพราทะเล/หมึก/กุ้ง', ingName: 'ข้าวสารหอมมะลิ', qty: 0.15 },
        { menuName: 'ข้าวผัดหมู', ingName: 'หมูสด / หมูสับ', qty: 0.10 },
        { menuName: 'ข้าวผัดหมู', ingName: 'ไข่ไก่สด', qty: 1.0 },
        { menuName: 'ข้าวผัดหมู', ingName: 'ข้าวสารหอมมะลิ', qty: 0.18 },
        { menuName: 'ข้าวผัดหมู', ingName: 'ผักคะน้าสด', qty: 0.02 },
        { menuName: 'ข้าวผัดกุ้ง', ingName: 'กุ้งสด', qty: 0.12 },
        { menuName: 'ข้าวผัดกุ้ง', ingName: 'ไข่ไก่สด', qty: 1.0 },
        { menuName: 'ข้าวผัดกุ้ง', ingName: 'ข้าวสารหอมมะลิ', qty: 0.18 },
        { menuName: 'ข้าวผัดกุ้ง', ingName: 'ผักคะน้าสด', qty: 0.02 },
        { menuName: 'ข้าวผัดทะเล/หมึก/กุ้ง', ingName: 'กุ้งสด', qty: 0.07 },
        { menuName: 'ข้าวผัดทะเล/หมึก/กุ้ง', ingName: 'หมึกสด', qty: 0.07 },
        { menuName: 'ข้าวผัดทะเล/หมึก/กุ้ง', ingName: 'ไข่ไก่สด', qty: 1.0 },
        { menuName: 'ข้าวผัดทะเล/หมึก/กุ้ง', ingName: 'ข้าวสารหอมมะลิ', qty: 0.18 },
        { menuName: 'ข้าวผัดทะเล/หมึก/กุ้ง', ingName: 'ผักคะน้าสด', qty: 0.02 },
        { menuName: 'ผัดพริกแกงหมู', ingName: 'หมูสด / หมูสับ', qty: 0.12 },
        { menuName: 'ผัดพริกแกงหมู', ingName: 'พริกแกงเผ็ด', qty: 0.03 },
        { menuName: 'ผัดพริกแกงหมู', ingName: 'ถั่วฝักยาว', qty: 0.03 },
        { menuName: 'ผัดพริกแกงหมู', ingName: 'ข้าวสารหอมมะลิ', qty: 0.15 },
        { menuName: 'ผัดพริกแกงทะเล/หมึก/กุ้ง', ingName: 'กุ้งสด', qty: 0.07 },
        { menuName: 'ผัดพริกแกงทะเล/หมึก/กุ้ง', ingName: 'หมึกสด', qty: 0.07 },
        { menuName: 'ผัดพริกแกงทะเล/หมึก/กุ้ง', ingName: 'พริกแกงเผ็ด', qty: 0.03 },
        { menuName: 'ผัดพริกแกงทะเล/หมึก/กุ้ง', ingName: 'ถั่วฝักยาว', qty: 0.03 },
        { menuName: 'ผัดพริกแกงทะเล/หมึก/กุ้ง', ingName: 'ข้าวสารหอมมะลิ', qty: 0.15 },
        { menuName: 'ผัดคะน้าหมูกรอบ', ingName: 'หมูกรอบ', qty: 0.10 },
        { menuName: 'ผัดคะน้าหมูกรอบ', ingName: 'ผักคะน้าสด', qty: 0.10 },
        { menuName: 'ผัดคะน้าหมูกรอบ', ingName: 'พริกสดจินดาแดง', qty: 0.01 },
        { menuName: 'ผัดคะน้าหมูกรอบ', ingName: 'กระเทียมสด', qty: 0.01 },
        { menuName: 'ผัดคะน้าหมูกรอบ', ingName: 'ข้าวสารหอมมะลิ', qty: 0.15 },
        { menuName: 'ผัดคะน้าทะเล/หมึก/กุ้ง', ingName: 'กุ้งสด', qty: 0.07 },
        { menuName: 'ผัดคะน้าทะเล/หมึก/กุ้ง', ingName: 'หมึกสด', qty: 0.07 },
        { menuName: 'ผัดคะน้าทะเล/หมึก/กุ้ง', ingName: 'ผักคะน้าสด', qty: 0.10 },
        { menuName: 'ผัดคะน้าทะเล/หมึก/กุ้ง', ingName: 'กระเทียมสด', qty: 0.01 },
        { menuName: 'ผัดคะน้าทะเล/หมึก/กุ้ง', ingName: 'ข้าวสารหอมมะลิ', qty: 0.15 },
        { menuName: 'ข้าวหมูกระเทียม', ingName: 'หมูสด / หมูสับ', qty: 0.14 },
        { menuName: 'ข้าวหมูกระเทียม', ingName: 'กระเทียมสด', qty: 0.02 },
        { menuName: 'ข้าวหมูกระเทียม', ingName: 'ข้าวสารหอมมะลิ', qty: 0.15 },
        { menuName: 'ข้าวไข่เจียวหมูสับ', ingName: 'ไข่ไก่สด', qty: 2.0 },
        { menuName: 'ข้าวไข่เจียวหมูสับ', ingName: 'หมูสด / หมูสับ', qty: 0.06 },
        { menuName: 'ข้าวไข่เจียวหมูสับ', ingName: 'ข้าวสารหอมมะลิ', qty: 0.15 },
        { menuName: 'ข้าวไข่เจียวกุ้ง', ingName: 'ไข่ไก่สด', qty: 2.0 },
        { menuName: 'ข้าวไข่เจียวกุ้ง', ingName: 'กุ้งสด', qty: 0.06 },
        { menuName: 'ข้าวไข่เจียวกุ้ง', ingName: 'ข้าวสารหอมมะลิ', qty: 0.15 },
        { menuName: 'ส้มตำปูปลาร้า', ingName: 'มะละกอดิบขูด', qty: 0.20 },
        { menuName: 'ส้มตำปูปลาร้า', ingName: 'พริกสดจินดาแดง', qty: 0.02 },
        { menuName: 'ส้มตำปูปลาร้า', ingName: 'ปูเค็ม/ปูดอง', qty: 1.0 },
        { menuName: 'ส้มตำปูปลาร้า', ingName: 'น้ำปลาร้าปรุงสุก', qty: 0.05 },
        { menuName: 'ส้มตำปูปลาร้า', ingName: 'มะนาวสด', qty: 1.0 },
        { menuName: 'ส้มตำปูปลาร้า', ingName: 'ถั่วฝักยาว', qty: 0.02 },
        { menuName: 'ส้มตำปูปลาร้า', ingName: 'มะเขือเทศสีดา', qty: 0.03 },
        { menuName: 'ส้มตำไทย', ingName: 'มะละกอดิบขูด', qty: 0.20 },
        { menuName: 'ส้มตำไทย', ingName: 'พริกสดจินดาแดง', qty: 0.02 },
        { menuName: 'ส้มตำไทย', ingName: 'ถั่วลิสงคั่วบด', qty: 0.02 },
        { menuName: 'ส้มตำไทย', ingName: 'กุ้งแห้ง', qty: 0.01 },
        { menuName: 'ส้มตำไทย', ingName: 'มะนาวสด', qty: 1.0 },
        { menuName: 'ส้มตำไทย', ingName: 'มะเขือเทศสีดา', qty: 0.03 },
        { menuName: 'ลาบหมู', ingName: 'หมูสด / หมูสับ', qty: 0.15 },
        { menuName: 'ลาบหมู', ingName: 'ข้าวคั่ว', qty: 0.01 },
        { menuName: 'ลาบหมู', ingName: 'พริกป่น', qty: 0.01 },
        { menuName: 'ลาบหมู', ingName: 'มะนาวสด', qty: 1.0 },
        { menuName: 'ยำวุ้นเส้นทะเล', ingName: 'วุ้นเส้น', qty: 1.0 },
        { menuName: 'ยำวุ้นเส้นทะเล', ingName: 'กุ้งสด', qty: 0.06 },
        { menuName: 'ยำวุ้นเส้นทะเล', ingName: 'หมึกสด', qty: 0.06 },
        { menuName: 'ยำวุ้นเส้นทะเล', ingName: 'หมูสด / หมูสับ', qty: 0.04 },
        { menuName: 'ยำวุ้นเส้นทะเล', ingName: 'มะนาวสด', qty: 1.0 },
        { menuName: 'ยำวุ้นเส้นทะเล', ingName: 'มะเขือเทศสีดา', qty: 0.03 },
        { menuName: 'ยำวุ้นเส้นทะเล', ingName: 'ถั่วลิสงคั่วบด', qty: 0.02 },
        { menuName: 'ไก่ทอด (สะโพก)', ingName: 'เนื้อสะโพกไก่', qty: 0.25 },
        { menuName: 'ไก่ทอด (สะโพก)', ingName: 'แป้งทอดกรอบ', qty: 0.03 },
        { menuName: 'ไก่ทอด (ปีก)', ingName: 'ปีกไก่สด', qty: 0.2 },
        { menuName: 'ไก่ทอด (ปีก)', ingName: 'แป้งทอดกรอบ', qty: 0.02 },
        { menuName: 'น้ำเก๊กฮวย', ingName: 'ดอกเก๊กฮวยอบแห้ง', qty: 1.0 },
        { menuName: 'โค้ก (กระป๋อง)', ingName: 'โค้กกระป๋อง', qty: 1.0 },
        { menuName: 'สไปรท์ (Sprite)', ingName: 'สไปรท์กระป๋อง', qty: 1.0 },
        { menuName: 'น้ำดื่ม', ingName: 'น้ำดื่มขวด', qty: 1.0 },
        { menuName: 'ข้าวเปล่า', ingName: 'ข้าวสารหอมมะลิ', qty: 0.15 },
        { menuName: 'ข้าวเหนียว', ingName: 'ข้าวเหนียว', qty: 0.15 },
        { menuName: 'น้ำตกหมู', ingName: 'หมูสด / หมูสับ', qty: 0.15 },
        { menuName: 'น้ำตกหมู', ingName: 'ข้าวคั่ว', qty: 0.01 },
        { menuName: 'น้ำตกหมู', ingName: 'พริกป่น', qty: 0.01 },
        { menuName: 'น้ำตกหมู', ingName: 'มะนาวสด', qty: 1.0 },
    ];
    try {
        await prisma.menuIngredient.deleteMany({});
        console.log('🧹 ล้างข้อมูลสูตรเดิมตกค้างใน MENU_INGREDIENTS ทั้งหมดเรียบร้อยแล้ว');
    }
    catch (e) {
        console.warn('Clear menuIngredient notice:', e.message);
    }
    let addedRecipes = 0;
    for (const r of recipes) {
        const menuIds = getMenuIds(r.menuName);
        const iId = getIngId(r.ingName);
        if (menuIds.length > 0 && iId) {
            for (const mId of menuIds) {
                try {
                    await prisma.menuIngredient.create({
                        data: {
                            menu_id: mId,
                            ingredient_id: iId,
                            quantity_used: r.qty,
                        },
                    });
                    addedRecipes++;
                }
                catch (e) {
                }
            }
        }
    }
    console.log(`✅ บันทึกสูตรอาหารและการใช้วัตถุดิบเรียบร้อยแล้ว (${addedRecipes} รายการที่ผูก)`);
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