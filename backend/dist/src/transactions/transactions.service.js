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
const Stripe = require('stripe');
let TransactionsService = class TransactionsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
            apiVersion: '2024-12-18.acacia',
        });
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
    async createStripeIntent(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { order_id: orderId },
        });
        if (!order) {
            throw new common_1.NotFoundException(`ไม่พบคำสั่งซื้อรหัส #${orderId}`);
        }
        const amountInSatang = Math.round(Number(order.total_price) * 100);
        if (amountInSatang <= 0) {
            throw new common_1.BadRequestException('ยอดชำระต้องมากกว่า 0 บาท');
        }
        let paymentIntent = null;
        try {
            if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
                paymentIntent = await this.stripe.paymentIntents.create({
                    amount: amountInSatang,
                    currency: 'thb',
                    payment_method_types: ['card', 'promptpay'],
                    metadata: {
                        order_id: order.order_id.toString(),
                    },
                });
            }
        }
        catch (err) {
            console.warn('Stripe API warning (falling back to mock intent):', err?.message);
        }
        const intentId = paymentIntent?.id || `pi_stripe_${Date.now()}`;
        const clientSecret = paymentIntent?.client_secret || `${intentId}_secret_${Math.random().toString(36).substring(7)}`;
        await this.prisma.transaction.create({
            data: {
                order_id: order.order_id,
                amount: order.total_price,
                payment_method: 'STRIPE',
                payment_status: 'PENDING',
            },
        });
        return {
            clientSecret,
            paymentIntentId: intentId,
            amount: order.total_price,
            currency: 'THB',
        };
    }
    async confirmStripePaymentTest(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { order_id: orderId },
        });
        if (!order) {
            throw new common_1.NotFoundException(`ไม่พบคำสั่งซื้อรหัส #${orderId}`);
        }
        await this.prisma.transaction.updateMany({
            where: { order_id: orderId },
            data: { payment_status: 'COMPLETED' },
        });
        const updated = await this.prisma.order.update({
            where: { order_id: orderId },
            data: { status: 'PAID' },
        });
        if (order.table_id) {
            const remainingUnpaid = await this.prisma.order.count({
                where: {
                    table_id: order.table_id,
                    status: { in: ['PENDING', 'COOKING', 'READY', 'SERVED'] },
                    order_id: { not: orderId },
                },
            });
            if (remainingUnpaid === 0) {
                await this.prisma.table.update({
                    where: { table_id: order.table_id },
                    data: { status: 'AVAILABLE' },
                }).catch(() => { });
            }
        }
        return updated;
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map