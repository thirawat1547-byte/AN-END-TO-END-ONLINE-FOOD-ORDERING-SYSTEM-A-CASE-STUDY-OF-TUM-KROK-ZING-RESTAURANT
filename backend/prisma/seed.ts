import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
    console.log('🧹 Clearing old data (to prevent duplicates)...')
    // ต้องลบจากตารางลูก (ที่มี Foreign Key) ย้อนกลับไปหาตารางแม่ เพื่อไม่ให้ติด Error
    await prisma.transaction.deleteMany()
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.menuAllergen.deleteMany()
    await prisma.menuIngredient.deleteMany()
    await prisma.menu.deleteMany()
    await prisma.promotion.deleteMany()
    await prisma.allergen.deleteMany()
    await prisma.ingredient.deleteMany()
    await prisma.category.deleteMany()
    await prisma.table.deleteMany()
    await prisma.user.deleteMany()

    console.log('🌱 Start seeding complete data...')

    // 1. ผู้ใช้งานระบบ (Users)
    const admin = await prisma.user.create({
        data: { username: 'admin_tumkrok', password: 'hashed_password', email: 'admin@tumkrokzing.com', phone_number: '0800000001', role: 'Admin' }
    })
    const staff = await prisma.user.create({
        data: { username: 'staff_kitchen', password: 'hashed_password', email: 'staff@tumkrokzing.com', phone_number: '0800000002', role: 'Staff' }
    })
    const customer = await prisma.user.create({
        data: { username: 'sirichok_k', password: 'hashed_password', email: 'sirichok@gmail.com', phone_number: '0812345678', role: 'Customer' }
    })

    // 2. โต๊ะอาหาร (Tables)
    await prisma.table.createMany({
        data: [
            { table_number: 'T-01', capacity: 4, status: 'Available' },
            { table_number: 'T-02', capacity: 2, status: 'Available' },
            { table_number: 'T-03', capacity: 4, status: 'Available' },
            { table_number: 'T-04', capacity: 8, status: 'Available' },
            { table_number: 'T-05', capacity: 2, status: 'Occupied' }, // จำลองว่ามีคนนั่งอยู่
        ],
    })
    const table5 = await prisma.table.findFirst({ where: { table_number: 'T-05' } })

    // 3. หมวดหมู่อาหาร (Categories)
    const catIsan = await prisma.category.create({ data: { category_name: 'อาหารอีสาน' } })
    const catMain = await prisma.category.create({ data: { category_name: 'อาหารจานหลัก' } })
    const catYum = await prisma.category.create({ data: { category_name: 'ยำ' } })
    const catDrink = await prisma.category.create({ data: { category_name: 'เครื่องดื่ม' } })

    // 4. วัตถุดิบ (Ingredients)
    const papaya = await prisma.ingredient.create({ data: { ingredient_name: 'มะละกอดิบ', quantity_in_stock: 15.0, unit: 'กิโลกรัม', reorder_level: 5.0 } })
    const crab = await prisma.ingredient.create({ data: { ingredient_name: 'ปูเค็ม', quantity_in_stock: 50.0, unit: 'ตัว', reorder_level: 10.0 } })
    const chicken = await prisma.ingredient.create({ data: { ingredient_name: 'สะโพกไก่', quantity_in_stock: 10.0, unit: 'กิโลกรัม', reorder_level: 3.0 } })
    const seafood = await prisma.ingredient.create({ data: { ingredient_name: 'กุ้งและหมึก', quantity_in_stock: 8.0, unit: 'กิโลกรัม', reorder_level: 2.0 } })

    // 5. สารก่อภูมิแพ้ (Allergens)
    const allgShrimp = await prisma.allergen.create({ data: { allergen_name: 'กุ้ง / อาหารทะเล', icon_url: '/icons/shrimp.png' } })
    const allgPeanut = await prisma.allergen.create({ data: { allergen_name: 'ถั่วลิสง', icon_url: '/icons/peanut.png' } })

    // 6. โปรโมชัน (Promotions)
    const promoWelcome = await prisma.promotion.create({
        data: { code: 'WELCOME20', discount_type: 'Percentage', discount_value: 20.00, min_order_price: 300.00, expiry_date: new Date('2026-12-31T23:59:59Z') }
    })

    // 7. เมนูอาหาร (Menus)
    const menuSomtum = await prisma.menu.create({
        data: { category_id: catIsan.category_id, menu_name: 'ส้มตำปูปลาร้า', description: 'เผ็ดจัดจ้าน นัวปลาร้า', price: 40.00, image_url: '/images/somtum.jpg', calories: 200, is_available: true }
    })
    const menuChicken = await prisma.menu.create({
        data: { category_id: catIsan.category_id, menu_name: 'ไก่ทอด(สะโพก)', description: 'กรอบนอกนุ่มใน', price: 50.00, image_url: '/images/chicken.jpg', calories: 350, is_available: true }
    })
    const menuKaprao = await prisma.menu.create({
        data: { category_id: catMain.category_id, menu_name: 'กะเพราทะเล', description: 'หมึกและกุ้งสดใหม่', price: 60.00, image_url: '/images/kaprao_seafood.jpg', calories: 450, is_available: true }
    })
    const menuCoke = await prisma.menu.create({
        data: { category_id: catDrink.category_id, menu_name: 'โค้ก', description: 'สดชื่น ดับกระหาย', price: 20.00, image_url: '/images/coke.jpg', calories: 140, is_available: true }
    })

    // 8. ผูกสูตรอาหาร (Menu_Ingredients) และ สารก่อภูมิแพ้ (Menu_Allergens)
    await prisma.menuIngredient.createMany({
        data: [
            { menu_id: menuSomtum.menu_id, ingredient_id: papaya.ingredient_id, quantity_used: 0.15 },
            { menu_id: menuSomtum.menu_id, ingredient_id: crab.ingredient_id, quantity_used: 1.0 },
            { menu_id: menuChicken.menu_id, ingredient_id: chicken.ingredient_id, quantity_used: 0.2 },
            { menu_id: menuKaprao.menu_id, ingredient_id: seafood.ingredient_id, quantity_used: 0.15 },
        ],
    })
    await prisma.menuAllergen.createMany({
        data: [
            { menu_id: menuSomtum.menu_id, allergen_id: allgShrimp.allergen_id },
            { menu_id: menuSomtum.menu_id, allergen_id: allgPeanut.allergen_id },
            { menu_id: menuKaprao.menu_id, allergen_id: allgShrimp.allergen_id },
        ],
    })

    // 9. จำลองข้อมูลคำสั่งซื้อ (Order & OrderItems) สำหรับให้ Admin ดูยอดขาย
    const order1 = await prisma.order.create({
        data: {
            user_id: customer.user_id,
            table_id: table5?.table_id,
            order_type: 'In-store',
            status: 'Served',
            total_price: 150.00, // ส้มตำ 40 + ไก่ทอด 50 + กะเพรา 60
        }
    })

    await prisma.orderItem.createMany({
        data: [
            { order_id: order1.order_id, menu_id: menuSomtum.menu_id, quantity: 1, customization: { spiciness: "เผ็ดมาก", note: "ไม่ใส่ผงชูรส" }, subtotal: 40.00 },
            { order_id: order1.order_id, menu_id: menuChicken.menu_id, quantity: 1, customization: null, subtotal: 50.00 },
            { order_id: order1.order_id, menu_id: menuKaprao.menu_id, quantity: 1, customization: null, subtotal: 60.00 },
        ]
    })

    // 10. จำลองข้อมูลการชำระเงิน (Transaction)
    await prisma.transaction.create({
        data: {
            order_id: order1.order_id,
            amount: 150.00,
            payment_method: 'PromptPay',
            payment_status: 'Completed',
        }
    })

    console.log('✅ Seeding completely finished! Database is fully populated.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })