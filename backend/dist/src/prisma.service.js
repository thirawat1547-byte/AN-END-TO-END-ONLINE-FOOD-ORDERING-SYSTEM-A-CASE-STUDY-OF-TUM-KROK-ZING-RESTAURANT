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