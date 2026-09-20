"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PromotionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let PromotionsService = PromotionsService_1 = class PromotionsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PromotionsService_1.name);
    }
    async onModuleInit() {
        await this.ensureUserClaimedPromotionsTable();
        await this.seedDefaultPromotionsIfEmpty();
    }
    async ensureUserClaimedPromotionsTable() {
        try {
            await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS USER_CLAIMED_PROMOTIONS (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          promo_id INT NOT NULL,
          is_used BOOLEAN DEFAULT FALSE,
          claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          used_at TIMESTAMP NULL,
          UNIQUE KEY uq_user_promo (user_id, promo_id)
        );
      `);
            this.logger.log('Ensured USER_CLAIMED_PROMOTIONS table exists');
        }
        catch (err) {
            this.logger.error('Failed to ensure USER_CLAIMED_PROMOTIONS table', err);
        }
    }
    async seedDefaultPromotionsIfEmpty() {
        try {
            const count = await this.prisma.promotion.count();
            if (count === 0) {
                const nextYear = new Date();
                nextYear.setFullYear(nextYear.getFullYear() + 1);
                const defaults = [
                    {
                        code: 'ZING50',
                        discount_type: 'FIXED',
                        discount_value: 50,
                        min_order_price: 300,
                        expiry_date: nextYear,
                    },
                    {
                        code: 'SEP10',
                        discount_type: 'PERCENTAGE',
                        discount_value: 10,
                        min_order_price: 200,
                        expiry_date: nextYear,
                    },
                    {
                        code: 'WELCOME100',
                        discount_type: 'FIXED',
                        discount_value: 100,
                        min_order_price: 500,
                        expiry_date: nextYear,
                    },
                    {
                        code: 'DELIVERY20',
                        discount_type: 'FIXED',
                        discount_value: 20,
                        min_order_price: 200,
                        expiry_date: nextYear,
                    },
                ];
                for (const item of defaults) {
                    await this.prisma.promotion.create({ data: item });
                }
                this.logger.log('Seeded default promotions');
            }
        }
        catch (err) {
            this.logger.warn('Could not seed default promotions:', err.message);
        }
    }
    async findAll() {
        return this.prisma.promotion.findMany({
            orderBy: { promo_id: 'desc' },
        });
    }
    async findActive() {
        return this.prisma.promotion.findMany({
            where: {
                expiry_date: {
                    gte: new Date(),
                },
            },
            orderBy: { expiry_date: 'asc' },
        });
    }
    async findOne(promo_id) {
        const promo = await this.prisma.promotion.findUnique({
            where: { promo_id },
        });
        if (!promo) {
            throw new common_1.NotFoundException(`ไม่พบโปรโมชันรหัส #${promo_id}`);
        }
        return promo;
    }
    async findByCode(code) {
        const cleanCode = (code || '').trim().toUpperCase();
        const promo = await this.prisma.promotion.findUnique({
            where: { code: cleanCode },
        });
        if (!promo || new Date(promo.expiry_date) < new Date()) {
            throw new common_1.NotFoundException('โค้ดส่วนลดนี้ไม่ถูกต้อง หรือหมดอายุแล้ว');
        }
        return promo;
    }
    async claimPromotion(userId, promoId) {
        const promo = await this.findOne(promoId);
        if (new Date(promo.expiry_date) < new Date()) {
            throw new common_1.BadRequestException('ขออภัย โค้ดโปรโมชันนี้หมดอายุแล้ว ไม่สามารถเก็บได้');
        }
        try {
            await this.prisma.$executeRawUnsafe(`INSERT INTO USER_CLAIMED_PROMOTIONS (user_id, promo_id) 
         VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE claimed_at = claimed_at;`, userId, promoId);
            return {
                success: true,
                message: `เก็บโค้ดส่วนลด "${promo.code}" สำเร็จ! สามารถนำไปใช้เป็นส่วนลดได้ที่หน้าชำระเงินออนไลน์`,
                promo_id: promoId,
                code: promo.code,
            };
        }
        catch (err) {
            throw new common_1.BadRequestException('ไม่สามารถเก็บโค้ดโปรโมชันได้: ' + err.message);
        }
    }
    async getMyPromotions(userId) {
        try {
            const rows = await this.prisma.$queryRawUnsafe(`SELECT 
           ucp.id AS claim_id,
           ucp.promo_id,
           ucp.is_used,
           ucp.claimed_at,
           ucp.used_at,
           p.code,
           p.discount_type,
           p.discount_value,
           p.min_order_price,
           p.expiry_date
         FROM USER_CLAIMED_PROMOTIONS ucp
         JOIN PROMOTIONS p ON ucp.promo_id = p.promo_id
         WHERE ucp.user_id = ?
         ORDER BY ucp.is_used ASC, p.expiry_date ASC;`, userId);
            return rows.map((r) => ({
                claim_id: Number(r.claim_id),
                promo_id: Number(r.promo_id),
                is_used: Boolean(r.is_used),
                claimed_at: r.claimed_at,
                used_at: r.used_at,
                code: r.code,
                discount_type: r.discount_type,
                discount_value: Number(r.discount_value),
                min_order_price: Number(r.min_order_price || 0),
                expiry_date: r.expiry_date,
                is_expired: new Date(r.expiry_date) < new Date(),
            }));
        }
        catch (err) {
            this.logger.warn(`Could not get claimed promotions for user #${userId}:`, err.message);
            return [];
        }
    }
    async create(createDto) {
        const existing = await this.prisma.promotion.findUnique({
            where: { code: createDto.code.trim().toUpperCase() },
        });
        if (existing) {
            throw new common_1.BadRequestException('รหัสโปรโมชันนี้ถูกใช้งานแล้ว');
        }
        return this.prisma.promotion.create({
            data: {
                code: createDto.code.trim().toUpperCase(),
                discount_type: createDto.discount_type.toUpperCase(),
                discount_value: createDto.discount_value,
                min_order_price: createDto.min_order_price ?? 0,
                expiry_date: new Date(createDto.expiry_date),
            },
        });
    }
    async update(promo_id, updateDto) {
        await this.findOne(promo_id);
        return this.prisma.promotion.update({
            where: { promo_id },
            data: {
                ...updateDto,
                code: updateDto.code ? updateDto.code.trim().toUpperCase() : undefined,
                discount_type: updateDto.discount_type ? updateDto.discount_type.toUpperCase() : undefined,
                expiry_date: updateDto.expiry_date ? new Date(updateDto.expiry_date) : undefined,
            },
        });
    }
    async remove(promo_id) {
        await this.findOne(promo_id);
        return this.prisma.promotion.delete({
            where: { promo_id },
        });
    }
};
exports.PromotionsService = PromotionsService;
exports.PromotionsService = PromotionsService = PromotionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PromotionsService);
//# sourceMappingURL=promotions.service.js.map