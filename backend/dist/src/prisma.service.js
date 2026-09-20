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
          SET t.status = 'OCCUPIED'
          WHERE EXISTS (
            SELECT 1 FROM ORDERS o
            WHERE o.table_id = t.table_id
            AND o.status IN ('PENDING', 'COOKING', 'READY', 'PAID')
          );
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