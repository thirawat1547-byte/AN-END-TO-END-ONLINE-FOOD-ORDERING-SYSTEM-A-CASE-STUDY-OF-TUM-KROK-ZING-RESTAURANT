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
let OrdersService = class OrdersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createOrderDto) {
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
                const itemSubtotal = Number(menu.price) * item.quantity;
                totalAmount += itemSubtotal;
                orderItemsData.push({
                    menu_id: item.menu_id,
                    quantity: item.quantity,
                    unit_price: menu.price,
                    subtotal: itemSubtotal,
                    notes: item.notes,
                });
            }
            const order = await tx.order.create({
                data: {
                    table_id: createOrderDto.table_id,
                    user_id: createOrderDto.user_id,
                    total_amount: totalAmount,
                    order_status: 'PENDING',
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
                },
            });
            return order;
        });
    }
    async findAll(status, tableId) {
        return this.prisma.order.findMany({
            where: {
                ...(status && { order_status: status }),
                ...(tableId && { table_id: tableId }),
            },
            include: {
                order_items: {
                    include: { menu: true },
                },
                table: true,
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
                user: {
                    select: { user_id: true, username: true, phone_number: true },
                },
            },
        });
        if (!order) {
            throw new common_1.NotFoundException(`ไม่พบคำสั่งซื้อรหัส #${id}`);
        }
        return order;
    }
    async updateStatus(id, updateOrderStatusDto) {
        await this.findOne(id);
        return this.prisma.order.update({
            where: { order_id: id },
            data: { order_status: updateOrderStatusDto.status },
        });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map