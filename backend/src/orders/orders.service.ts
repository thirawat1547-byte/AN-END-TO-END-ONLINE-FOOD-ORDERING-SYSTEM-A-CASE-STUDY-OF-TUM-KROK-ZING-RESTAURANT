// src/orders/orders.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. รับคำสั่งซื้อและคำนวณราคาแบบ Transaction
  async create(createOrderDto: CreateOrderDto) {
    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new BadRequestException('รายการสั่งซื้อต้องมีอาหารอย่างน้อย 1 รายการ');
    }

    return this.prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of createOrderDto.items) {
        const menu = await tx.menu.findUnique({
          where: { menu_id: item.menu_id },
        });

        if (!menu) {
          throw new NotFoundException(`ไม่พบเมนูอาหารรหัส #${item.menu_id}`);
        }

        const itemSubtotal = Number(menu.price) * item.quantity;
        totalAmount += itemSubtotal;

        orderItemsData.push({
  menu_id: item.menu_id,
  quantity: item.quantity,
  subtotal: itemSubtotal,
  customization: item.notes || null, // นำ notes มาบันทึกลงฟิลด์ customization
});
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
          ...(createOrderDto.user_id && {
            user: {
              connect: { user_id: createOrderDto.user_id },
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
        },
      });

      return order;
    });
  }

  // 2. ดึงรายการออร์เดอร์ทั้งหมด
  async findAll(status?: string, tableId?: number) {
    return this.prisma.order.findMany({
      where: {
        ...(status && { status: status }),
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

  // 3. ดูรายละเอียดออร์เดอร์ตาม ID
  async findOne(id: number) {
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
      throw new NotFoundException(`ไม่พบคำสั่งซื้อรหัส #${id}`);
    }

    return order;
  }

  // 4. อัปเดตสถานะคำสั่งซื้อ
  async updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto) {
    await this.findOne(id);

    return this.prisma.order.update({
      where: { order_id: id },
      data: { status: updateOrderStatusDto.status },
    });
  }
}