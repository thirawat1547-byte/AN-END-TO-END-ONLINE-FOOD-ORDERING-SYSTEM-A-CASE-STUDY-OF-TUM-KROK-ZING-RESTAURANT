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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const settings_service_1 = require("../settings/settings.service");
let OrdersService = class OrdersService {
    constructor(prisma, settingsService) {
        this.prisma = prisma;
        this.settingsService = settingsService;
    }
    async create(createOrderDto) {
        const storeSettings = await this.settingsService.getSettings();
        if (!storeSettings.is_open) {
            throw new common_1.BadRequestException('ขออภัย ขณะนี้ร้านปิดให้บริการชั่วคราว ไม่สามารถรับคำสั่งซื้อได้ในขณะนี้');
        }
        if (!createOrderDto.items || createOrderDto.items.length === 0) {
            throw new common_1.BadRequestException('รายการสั่งซื้อต้องมีอาหารอย่างน้อย 1 รายการ');
        }
        return this.prisma.$transaction(async (tx) => {
            let totalAmount = 0;
            const orderItemsData = [];
            for (const item of createOrderDto.items) {
                const menu = await tx.menu.findUnique({
                    where: { menu_id: item.menu_id },
                });
                if (!menu) {
                    throw new common_1.NotFoundException(`ไม่พบเมนูอาหารรหัส #${item.menu_id}`);
                }
                if (menu.is_available === false) {
                    throw new common_1.BadRequestException(`ขออภัย เมนู "${menu.menu_name}" ปิดรับออเดอร์ชั่วคราว`);
                }
                const unitPrice = Number(menu.price);
                totalAmount += unitPrice * item.quantity;
                orderItemsData.push({
                    menu_id: item.menu_id,
                    quantity: item.quantity,
                    unit_price: unitPrice,
                    notes: item.notes || null,
                });
            }
            let validUserId = undefined;
            if (createOrderDto.user_id) {
                const existingUser = await tx.user.findUnique({
                    where: { user_id: createOrderDto.user_id },
                });
                if (existingUser) {
                    validUserId = existingUser.user_id;
                }
            }
            let appliedPromoId = undefined;
            let discountAmount = 0;
            if (createOrderDto.promo_id || createOrderDto.promo_code) {
                if (createOrderDto.order_type === 'DINE_IN') {
                    throw new common_1.BadRequestException('ขออภัย โค้ดส่วนลดและโปรโมชันสามารถใช้ได้เฉพาะการสั่งออนไลน์ (เดลิเวอรี่) ผ่านเว็บไซต์เท่านั้น');
                }
                let promo = null;
                if (createOrderDto.promo_id) {
                    promo = await tx.promotion.findUnique({
                        where: { promo_id: createOrderDto.promo_id },
                    });
                }
                else if (createOrderDto.promo_code) {
                    promo = await tx.promotion.findUnique({
                        where: { code: createOrderDto.promo_code.trim().toUpperCase() },
                    });
                }
                if (!promo) {
                    throw new common_1.BadRequestException('ไม่พบโค้ดส่วนลดนี้ในระบบ');
                }
                if (new Date(promo.expiry_date) < new Date()) {
                    throw new common_1.BadRequestException('ขออภัย โค้ดส่วนลดนี้หมดอายุการใช้งานแล้ว');
                }
                if (totalAmount < Number(promo.min_order_price || 0)) {
                    throw new common_1.BadRequestException(`ยอดสั่งซื้ออาหารขั้นต่ำต้องครบ ฿${Number(promo.min_order_price)} จึงจะสามารถใช้โค้ด "${promo.code}" ได้`);
                }
                const promoType = (promo.discount_type || '').toUpperCase();
                if (promoType === 'PERCENTAGE' || promoType === 'PERCENT') {
                    discountAmount = (totalAmount * Number(promo.discount_value)) / 100;
                }
                else {
                    discountAmount = Number(promo.discount_value);
                }
                discountAmount = Math.min(discountAmount, totalAmount);
                totalAmount = Math.max(0, totalAmount - discountAmount);
                appliedPromoId = promo.promo_id;
                if (validUserId) {
                    try {
                        await tx.$executeRawUnsafe(`UPDATE USER_CLAIMED_PROMOTIONS SET is_used = TRUE, used_at = NOW() 
               WHERE user_id = ? AND promo_id = ?;`, validUserId, appliedPromoId);
                    }
                    catch (e) { }
                }
            }
            const order = await tx.order.create({
                data: {
                    order_type: createOrderDto.order_type || 'DINE_IN',
                    total_price: totalAmount,
                    status: 'PENDING',
                    ...(createOrderDto.table_id && {
                        table: {
                            connect: { table_id: createOrderDto.table_id },
                        },
                    }),
                    ...(validUserId && {
                        user: {
                            connect: { user_id: validUserId },
                        },
                    }),
                    ...(appliedPromoId && {
                        promotion: {
                            connect: { promo_id: appliedPromoId },
                        },
                    }),
                    order_items: {
                        create: orderItemsData,
                    },
                },
                include: {
                    order_items: {
                        include: {
                            menu: true,
                        },
                    },
                    table: true,
                    promotion: true,
                },
            });
            if (createOrderDto.table_id) {
                try {
                    await tx.table.update({
                        where: { table_id: createOrderDto.table_id },
                        data: { status: 'OCCUPIED' },
                    });
                }
                catch (e) {
                }
            }
            for (const item of createOrderDto.items) {
                const menuIngredients = await tx.menuIngredient.findMany({
                    where: { menu_id: item.menu_id },
                });
                for (const mi of menuIngredients) {
                    const deductAmount = Number(mi.quantity_used) * item.quantity;
                    if (deductAmount > 0) {
                        await tx.ingredient.update({
                            where: { ingredient_id: mi.ingredient_id },
                            data: {
                                quantity: {
                                    decrement: deductAmount,
                                },
                            },
                        }).catch((err) => {
                            console.warn(`[Stock Deduction] ไม่สามารถตัดสต็อกวัตถุดิบ #${mi.ingredient_id}:`, err?.message);
                        });
                    }
                }
            }
            return order;
        });
    }
    async findAll(status, tableId, orderType) {
        return this.prisma.order.findMany({
            where: {
                ...(status && { status: status }),
                ...(tableId && { table_id: tableId }),
                ...(orderType && { order_type: orderType }),
            },
            include: {
                order_items: {
                    include: { menu: true },
                },
                table: true,
                transaction: true,
                user: {
                    select: {
                        user_id: true,
                        username: true,
                        email: true,
                        phone_number: true,
                        address: true,
                    },
                },
            },
            orderBy: { order_id: 'desc' },
        });
    }
    async findByUser(userId) {
        return this.prisma.order.findMany({
            where: { user_id: userId },
            include: {
                order_items: {
                    include: { menu: true },
                },
                table: true,
                transaction: true,
            },
            orderBy: { order_id: 'desc' },
        });
    }
    async findActiveUserOrder(userId, requestedOrderId) {
        if (!userId || isNaN(userId)) {
            return null;
        }
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
        await this.prisma.order.updateMany({
            where: {
                order_type: 'DELIVERY',
                status: { in: ['PENDING', 'PAID', 'COOKING', 'READY', 'IN_DELIVERY'] },
                created_at: { lt: sixHoursAgo },
            },
            data: {
                status: 'COMPLETED',
            },
        }).catch(() => { });
        if (requestedOrderId && !isNaN(requestedOrderId)) {
            const specific = await this.prisma.order.findFirst({
                where: {
                    order_id: requestedOrderId,
                    user_id: userId,
                    order_type: 'DELIVERY',
                },
                include: {
                    order_items: {
                        include: { menu: true },
                    },
                    table: true,
                    transaction: true,
                    user: {
                        select: {
                            user_id: true,
                            username: true,
                            phone_number: true,
                            address: true,
                        },
                    },
                },
            });
            if (specific)
                return specific;
        }
        return this.prisma.order.findFirst({
            where: {
                user_id: userId,
                order_type: 'DELIVERY',
                status: {
                    in: ['PENDING', 'PAID', 'COOKING', 'READY', 'IN_DELIVERY'],
                },
                created_at: {
                    gte: sixHoursAgo,
                },
            },
            include: {
                order_items: {
                    include: { menu: true },
                },
                table: true,
                transaction: true,
                user: {
                    select: {
                        user_id: true,
                        username: true,
                        phone_number: true,
                        address: true,
                    },
                },
            },
            orderBy: { order_id: 'desc' },
        });
    }
    async findOne(id) {
        const order = await this.prisma.order.findUnique({
            where: { order_id: id },
            include: {
                order_items: {
                    include: { menu: true },
                },
                table: true,
                transaction: true,
                user: {
                    select: { user_id: true, username: true, phone_number: true, address: true },
                },
            },
        });
        if (!order) {
            throw new common_1.NotFoundException(`ไม่พบคำสั่งซื้อรหัส #${id}`);
        }
        return order;
    }
    async updateStatus(id, updateOrderStatusDto) {
        const order = await this.findOne(id);
        const updated = await this.prisma.order.update({
            where: { order_id: id },
            data: { status: updateOrderStatusDto.status },
        });
        if (order.table_id) {
            const statusUpper = updateOrderStatusDto.status.toUpperCase();
            if (['PENDING', 'COOKING', 'READY', 'SERVED'].includes(statusUpper)) {
                await this.prisma.table.update({
                    where: { table_id: order.table_id },
                    data: { status: 'OCCUPIED' },
                }).catch(() => { });
            }
            else if (['PAID', 'CANCELLED'].includes(statusUpper)) {
                const remainingUnpaid = await this.prisma.order.count({
                    where: {
                        table_id: order.table_id,
                        status: { in: ['PENDING', 'COOKING', 'READY', 'SERVED'] },
                        order_id: { not: id },
                    },
                });
                if (remainingUnpaid === 0) {
                    await this.prisma.table.update({
                        where: { table_id: order.table_id },
                        data: { status: 'AVAILABLE' },
                    }).catch(() => { });
                }
            }
        }
        const statusUpper = updateOrderStatusDto.status.toUpperCase();
        if (statusUpper === 'CANCELLED' && order.status.toUpperCase() !== 'CANCELLED') {
            for (const item of order.order_items) {
                const menuIngredients = await this.prisma.menuIngredient.findMany({
                    where: { menu_id: item.menu_id },
                });
                for (const mi of menuIngredients) {
                    const restoreAmount = Number(mi.quantity_used) * item.quantity;
                    if (restoreAmount > 0) {
                        await this.prisma.ingredient.update({
                            where: { ingredient_id: mi.ingredient_id },
                            data: {
                                quantity: {
                                    increment: restoreAmount,
                                },
                            },
                        }).catch(() => { });
                    }
                }
            }
        }
        return updated;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        settings_service_1.SettingsService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map