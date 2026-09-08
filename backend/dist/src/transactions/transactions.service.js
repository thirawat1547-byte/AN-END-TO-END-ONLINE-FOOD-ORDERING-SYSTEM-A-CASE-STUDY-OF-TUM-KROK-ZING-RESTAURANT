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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let TransactionsService = class TransactionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createTransactionDto) {
        const { order_id, amount, payment_method, payment_slip_url } = createTransactionDto;
        const order = await this.prisma.order.findUnique({
            where: { order_id },
        });
        if (!order) {
            throw new common_1.NotFoundException(`ไม่พบคำสั่งซื้อรหัส #${order_id}`);
        }
        if (order.status === 'COMPLETED') {
            throw new common_1.BadRequestException('คำสั่งซื้อนี้ถูกชำระเงินและปิดบิลเรียบร้อยแล้ว');
        }
        return this.prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.create({
                data: {
                    order_id,
                    amount,
                    payment_method,
                    payment_status: 'COMPLETED',
                    payment_slip_url: payment_slip_url || null,
                },
            });
            await tx.order.update({
                where: { order_id },
                data: { status: 'COMPLETED' },
            });
            return transaction;
        });
    }
    async findAll() {
        return this.prisma.transaction.findMany({
            orderBy: { transaction_id: 'desc' },
            include: {
                order: {
                    include: {
                        table: true,
                        order_items: {
                            include: { menu: true },
                        },
                    },
                },
            },
        });
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map