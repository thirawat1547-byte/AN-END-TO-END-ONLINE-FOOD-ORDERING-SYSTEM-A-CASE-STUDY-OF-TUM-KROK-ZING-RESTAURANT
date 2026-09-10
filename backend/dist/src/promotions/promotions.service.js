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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let PromotionsService = class PromotionsService {
    constructor(prisma) {
        this.prisma = prisma;
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
        const promo = await this.prisma.promotion.findUnique({
            where: { code },
        });
        if (!promo || new Date(promo.expiry_date) < new Date()) {
            throw new common_1.NotFoundException('โค้ดส่วนลดนี้ไม่ถูกต้อง หรือหมดอายุแล้ว');
        }
        return promo;
    }
    async create(createDto) {
        const existing = await this.prisma.promotion.findUnique({
            where: { code: createDto.code },
        });
        if (existing) {
            throw new common_1.BadRequestException('รหัสโปรโมชันนี้ถูกใช้งานแล้ว');
        }
        return this.prisma.promotion.create({
            data: {
                code: createDto.code,
                discount_type: createDto.discount_type,
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
exports.PromotionsService = PromotionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PromotionsService);
//# sourceMappingURL=promotions.service.js.map