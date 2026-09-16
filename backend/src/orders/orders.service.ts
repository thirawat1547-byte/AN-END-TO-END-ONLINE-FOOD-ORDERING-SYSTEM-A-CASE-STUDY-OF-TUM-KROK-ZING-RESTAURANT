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

        const unitPrice = Number(menu.price);
        totalAmount += unitPrice * item.quantity;

        // บันทึกข้อมูลรายการอาหาร พร้อมหมายเหตุตัวเลือกที่ลูกค้าเลือก (notes)
        orderItemsData.push({
          menu_id: item.menu_id,
          quantity: item.quantity,
          unit_price: unitPrice,
          notes: item.notes || null,
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

      // ถ้าเป็นการสั่งที่โต๊ะ ให้ปรับสถานะโต๊ะเป็น OCCUPIED ทันที
      if (createOrderDto.table_id) {
        try {
          await tx.table.update({
            where: { table_id: createOrderDto.table_id },
            data: { status: 'OCCUPIED' },
          });
        } catch (e) {
          // ignore if table doesn't exist
        }
      }

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

  // 3. ดึงประวัติคำสั่งซื้อเฉพาะของ User ที่ล็อกอิน
  async findByUser(userId: number) {
    return this.prisma.order.findMany({
      where: { user_id: userId },
      include: {
        order_items: {
          include: { menu: true },
        },
        table: true,
      },
      orderBy: { order_id: 'desc' },
    });
  }

  // 4. ดูรายละเอียดออร์เดอร์ตาม ID
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

  // 5. อัปเดตสถานะคำสั่งซื้อ
  async updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto) {
    const order = await this.findOne(id);

    const updated = await this.prisma.order.update({
      where: { order_id: id },
      data: { status: updateOrderStatusDto.status },
    });

    // ถ้าออเดอร์เสร็จสิ้น (COMPLETED/CANCELLED) และมีโต๊ะ ให้เช็คว่าเหลือออเดอร์อื่นค้างอยู่หรือไม่
    if (order.table_id) {
      const statusUpper = updateOrderStatusDto.status.toUpperCase();
      if (['COMPLETED', 'CANCELLED'].includes(statusUpper)) {
        const remaining = await this.prisma.order.count({
          where: {
            table_id: order.table_id,
            status: { in: ['PENDING', 'COOKING', 'READY', 'PAID'] },
            order_id: { not: id },
          },
        });
        if (remaining === 0) {
          await this.prisma.table.update({
            where: { table_id: order.table_id },
            data: { status: 'AVAILABLE' },
          }).catch(() => {});
        }
      } else if (['PENDING', 'COOKING', 'READY', 'PAID'].includes(statusUpper)) {
        await this.prisma.table.update({
          where: { table_id: order.table_id },
          data: { status: 'OCCUPIED' },
        }).catch(() => {});
      }
    }

    return updated;
  }
}