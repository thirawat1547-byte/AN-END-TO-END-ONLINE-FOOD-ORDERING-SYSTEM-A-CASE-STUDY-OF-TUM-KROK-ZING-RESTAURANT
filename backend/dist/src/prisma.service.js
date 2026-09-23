"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    constructor() {
        super(...arguments);
        this.logger = new common_1.Logger(PrismaService_1.name);
    }
    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('✅ เชื่อมต่อฐานข้อมูล MySQL สำเร็จ');
            const alterQueries = [
                'ALTER TABLE OrderItem ADD COLUMN notes TEXT NULL;',
                'ALTER TABLE ORDER_ITEMS ADD COLUMN notes TEXT NULL;',
            ];
            for (const query of alterQueries) {
                try {
                    await this.$executeRawUnsafe(query);
                    this.logger.log(`✅ เพิ่มคอลัมน์ notes สำเร็จ: ${query}`);
                }
                catch (e) {
                }
            }
            const sampleUpdates = [
                "UPDATE OrderItem SET notes = 'เผ็ดกลาง | ไข่ดาวไม่สุก' WHERE menu_id = 2 AND (notes IS NULL OR notes = '');",
                "UPDATE OrderItem SET notes = 'เผ็ดมาก | ไม่ใส่ผักชี | กุ้งสุกปานกลาง' WHERE menu_id = 9 AND (notes IS NULL OR notes = '');",
                "UPDATE ORDER_ITEMS SET notes = 'เผ็ดกลาง | ไข่ดาวไม่สุก' WHERE menu_id = 2 AND (notes IS NULL OR notes = '');",
                "UPDATE ORDER_ITEMS SET notes = 'เผ็ดมาก | ไม่ใส่ผักชี | กุ้งสุกปานกลาง' WHERE menu_id = 9 AND (notes IS NULL OR notes = '');",
            ];
            for (const updateSql of sampleUpdates) {
                try {
                    await this.$executeRawUnsafe(updateSql);
                }
                catch (e) {
                }
            }
            try {
                await this.$executeRawUnsafe(`
          UPDATE TABLES t
          SET t.status = CASE
            WHEN EXISTS (
              SELECT 1 FROM ORDERS o
              WHERE o.table_id = t.table_id
              AND o.status IN ('PENDING', 'COOKING', 'READY', 'SERVED')
            ) THEN 'OCCUPIED'
            ELSE 'AVAILABLE'
          END;
        `);
            }
            catch (e) { }
            const viewQueries = [
                `CREATE OR REPLACE VIEW ORDER_SUMMARIES_VIEW AS
         SELECT 
             o.order_id, 
             t.table_number, 
             o.total_price, 
             o.status, 
             o.created_at AS order_date
         FROM ORDERS o
         LEFT JOIN TABLES t ON o.table_id = t.table_id;`,
                `CREATE OR REPLACE VIEW TRANSACTION_RECEIPTS_VIEW AS
         SELECT 
             tr.transaction_id,
             tr.order_id,
             COALESCE(u.username, 'ลูกค้าทั่วไป') AS customer_name,
             tr.amount AS total_amount,
             tr.payment_method,
             tr.payment_status,
             o.created_at AS payment_date
         FROM TRANSACTIONS tr
         LEFT JOIN ORDERS o ON tr.order_id = o.order_id
         LEFT JOIN USERS u ON o.user_id = u.user_id;`,
                `CREATE OR REPLACE VIEW TOP_SELLING_MENUS_VIEW AS
         SELECT 
             m.menu_id,
             m.menu_name AS menu_name,
             COALESCE(c.category_name, 'ทั่วไป') AS category_name,
             CAST(COALESCE(SUM(oi.quantity), 0) AS SIGNED) AS total_sold,
             CAST(COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS DECIMAL(10,2)) AS total_revenue
         FROM MENUS m
         LEFT JOIN CATEGORIES c ON m.category_id = c.category_id
         LEFT JOIN ORDER_ITEMS oi ON m.menu_id = oi.menu_id
         GROUP BY m.menu_id, m.menu_name, c.category_name;`,
            ];
            for (const vSql of viewQueries) {
                try {
                    await this.$executeRawUnsafe(vSql);
                }
                catch (e) {
                }
            }
            const defaultMenus = [
                { category_id: 1, menu_name: 'กะเพราหมู', description: 'กะเพราหมูสับผัดพริกแห้ง หอมฟุ้ง อร่อยเด็ดสะใจ', price: 40, calories: 320, image_url: '/images/kapaomu.jpg' },
                { category_id: 1, menu_name: 'กะเพราทะเล/หมึก/กุ้ง', description: 'กะเพราซีฟู้ดสดใหม่ กุ้งปลาหมึกเด้ง เผ็ดร้อน ถึงเครื่อง', price: 60, calories: 280, image_url: '/images/kapaotaley.jpg' },
                { category_id: 1, menu_name: 'ข้าวผัดหมู', description: 'ข้าวผัดหอมกรุ่นกระทะ เมล็ดข้าวร่วนสวย ใส่หมูนุ่ม', price: 40, calories: 350, image_url: '/images/khaopadmu.jpg' },
                { category_id: 1, menu_name: 'ข้าวผัดทะเล/หมึก/กุ้ง', description: 'รวมมิตรทะเลผัดข้าวหอมมะลิ รสชาติกลมกล่อม', price: 60, calories: 340, image_url: '/images/khaopadtalay.jpg' },
                { category_id: 1, menu_name: 'ผัดพริกแกงหมู', description: 'พริกแกงเข้มข้นถึงเครื่องแกงใต้ ผัดถั่วฝักยาวและหมูนุ่ม', price: 40, calories: 310, image_url: '/images/pikkangmu.jpg' },
                { category_id: 1, menu_name: 'ผัดพริกแกงทะเล/หมึก/กุ้ง', description: 'ผัดพริกแกงรวมมิตรทะเล รสชาติจัดจ้านถึงใจ', price: 60, calories: 290, image_url: '/images/prikkangtalay.jpg' },
                { category_id: 1, menu_name: 'ผัดคะน้าหมูกรอบ', description: 'คะน้าสดกรอบผัดหมูกรอบชิ้นโต รสชาติกลมกล่อมหอมน้ำมันหอย', price: 40, calories: 380, image_url: '/images/kanamokrop.jpg' },
                { category_id: 1, menu_name: 'ผัดคะน้าทะเล/หมึก/กุ้ง', description: 'คะน้าสดกรอบผัดซีฟู้ดเนื้อแน่น ปรุงร้อนๆ จานต่อจาน', price: 60, calories: 270, image_url: '/images/kanatalay.jpg' },
                { category_id: 1, menu_name: 'ข้าวหมูกระเทียม', description: 'หมูหมักนุ่มผัดกระเทียมพริกไทยดำหอมเตะจมูก', price: 40, calories: 360, image_url: '/images/mookratiem.jpg' },
                { category_id: 1, menu_name: 'ข้าวไข่เจียวหมูสับ', description: 'ไข่เจียวฟูกรอบนอกนุ่มใน หมูสับแน่นๆ ทอดร้อนๆ', price: 40, calories: 390, image_url: '/images/kaijeawmoosub.jpg' },
                { category_id: 1, menu_name: 'ข้าวไข่เจียวกุ้ง', description: 'ไข่เจียวฟูใส่กุ้งสดเด้ง ทานคู่น้ำปลาพริกมะนาว', price: 50, calories: 380, image_url: '/images/kaikung.jpg' },
                { category_id: 2, menu_name: 'ส้มตำปูปลาร้า', description: 'ส้มตำปลาร้าต้มสุกสูตรเฉพาะ หอม นัว ถึงเครื่อง ปรุงรสตามสั่ง', price: 40, calories: 145, image_url: '/images/tumprara.jpg' },
                { category_id: 2, menu_name: 'ส้มตำไทย', description: 'ตำไทยรสกลมกล่อม เปรี้ยวหวานกำลังดี โรยถั่วคั่วหอมสดใหม่', price: 40, calories: 180, image_url: '/images/tumtai.jpg' },
                { category_id: 3, menu_name: 'ลาบหมู', description: 'หมูสับนุ่ม คลุกเคล้าข้าวคั่ว พริกป่น มะนาวแท้รสจัดจ้าน', price: 50, calories: 220, image_url: '/images/larbmoo.jpg' },
                { category_id: 3, menu_name: 'ยำวุ้นเส้นทะเล', description: 'ยำวุ้นเส้นใส่กุ้ง หมึก หมูสับ รสแซ่บครบรส', price: 70, calories: 240, image_url: '/images/yumtalay.jpg' },
                { category_id: 4, menu_name: 'ไก่ทอด (ปีก)', description: 'ปีกไก่ทอดกรอบนอกนุ่มใน หมักเครื่องเทศเข้าเนื้อ', price: 50, calories: 320, image_url: '/images/wingchick.jpg' },
                { category_id: 4, menu_name: 'ไก่ทอด (สะโพก)', description: 'สะโพกไก่ชิ้นโต ทอดกรอบไม่อมน้ำมัน เนื้อฉ่ำนุ่ม', price: 50, calories: 360, image_url: '/images/chick.jpg' },
                { category_id: 5, menu_name: 'น้ำเก๊กฮวย', description: 'น้ำเก๊กฮวยต้มสด หวานกำลังดี หอมเย็นชื่นใจ', price: 20, calories: 120, image_url: '/images/gek.jpg' },
                { category_id: 5, menu_name: 'โค้ก (กระป๋อง)', description: 'น้ำอัดลมโค้ก เย็นซ่าสดชื่น', price: 20, calories: 140, image_url: '/images/coke.jpg' },
                { category_id: 5, menu_name: 'สไปรท์ (Sprite)', description: 'น้ำอัดลมกลิ่นเลมอนไลม์ ซ่าสดชื่น', price: 20, calories: 140, image_url: '/images/sprite.jpg' },
                { category_id: 5, menu_name: 'น้ำดื่ม', description: 'น้ำดื่มสะอาด ตราตำครกซิ่ง', price: 10, calories: 0, image_url: '/images/water.jpg' },
                { category_id: 1, menu_name: 'ข้าวเปล่า', description: 'ข้าวสวยหอมมะลิ ร้อนๆ นุ่มอร่อย', price: 10, calories: 150, image_url: '/images/kao.jpg' },
                { category_id: 2, menu_name: 'ข้าวเหนียว', description: 'ข้าวเหนียวนุ่ม ร้อนๆ หอมอร่อย', price: 10, calories: 150, image_url: '/images/kaon.jpg' },
            ];
            try {
                const dupes = await this.menu.findMany({
                    where: {
                        menu_name: {
                            in: ['ปีกไก่ทอด', 'ไข่เจียวหมูสับ', 'ไข่เจียวกุ้ง']
                        }
                    }
                });
                for (const dupe of dupes) {
                    await this.menuIngredient.deleteMany({
                        where: { menu_id: dupe.menu_id }
                    });
                    await this.menu.delete({
                        where: { menu_id: dupe.menu_id }
                    });
                    this.logger.log(`🧹 ทำความสะอาดเมนูซ้ำซ้อนสำเร็จ: ${dupe.menu_name} (ID: ${dupe.menu_id})`);
                }
            }
            catch (e) {
            }
            for (const dm of defaultMenus) {
                try {
                    const exists = await this.menu.findFirst({
                        where: {
                            OR: [
                                { menu_name: dm.menu_name },
                                { menu_name: dm.menu_name.replace('ข้าวไข่เจียว', 'ไข่เจียว') },
                                { menu_name: dm.menu_name.replace('ไก่ทอด (ปีก)', 'ปีกไก่ทอด') },
                                { menu_name: dm.menu_name.replace('กะเพรา', 'กระเพรา') },
                                { menu_name: dm.menu_name.replace('กระเพรา', 'กะเพรา') }
                            ]
                        }
                    });
                    if (!exists) {
                        await this.menu.create({
                            data: {
                                category_id: dm.category_id,
                                menu_name: dm.menu_name,
                                description: dm.description,
                                price: dm.price,
                                calories: dm.calories,
                                image_url: dm.image_url,
                                is_available: true
                            }
                        });
                        this.logger.log(`✅ เพิ่มเมนูอาหารเริ่มต้นสำเร็จ: ${dm.menu_name}`);
                    }
                }
                catch (e) {
                }
            }
        }
        catch (err) {
            this.logger.error(`⚠️ ไม่สามารถเชื่อมต่อฐานข้อมูล MySQL (${err.message}) - โปรดตรวจสอบว่า MySQL รันอยู่`);
        }
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)()
], PrismaService);
//# sourceMappingURL=prisma.service.js.map