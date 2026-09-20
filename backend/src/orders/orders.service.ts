import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SettingsService } from '../settings/settings.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsService: SettingsService,
  ) {}

  // 1. รับคำสั่งซื้อและคำนวณราคาแบบ Transaction
  async create(createOrderDto: CreateOrderDto) {
    // ตรวจสอบสถานะการเปิด-ปิดร้านค้าจากระบบจริง
    const storeSettings = await this.settingsService.getSettings();
    if (!storeSettings.is_open) {
      throw new BadRequestException('ขออภัย ขณะนี้ร้านปิดให้บริการชั่วคราว ไม่สามารถรับคำสั่งซื้อได้ในขณะนี้');
    }

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

        if (menu.is_available === false) {
          throw new BadRequestException(`ขออภัย เมนู "${menu.menu_name}" ปิดรับออเดอร์ชั่วคราว`);
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

      let validUserId: number | undefined = undefined;
      if (createOrderDto.user_id) {
        const existingUser = await tx.user.findUnique({
          where: { user_id: createOrderDto.user_id },
        });
        if (existingUser) {
          validUserId = existingUser.user_id;
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

      // ตัดสต็อกวัตถุดิบอัตโนมัติตามสูตรอาหาร (MenuIngredient) ตรงตาม Sequence Diagram
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

  // 2. ดึงรายการออร์เดอร์ทั้งหมด (รองรับตัวกรอง status, tableId, orderType)
  async findAll(status?: string, tableId?: number, orderType?: string) {
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

  // 3. ดึงประวัติคำสั่งซื้อเฉพาะของ User ที่ล็อกอิน
  async findByUser(userId: number) {
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

  // 4. ดูรายละเอียดออร์เดอร์ตาม ID
  async findOne(id: number) {
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

    // สำคัญ: การเปลี่ยนสถานะออเดอร์ในครัว (COOKING, READY, SERVED)
    // อาหารถูกปรุงและเสิร์ฟให้ลูกค้าแล้ว แต่ลูกค้ายังนั่งทานและยังไม่ได้เช็คบิล/ชำระเงิน
    // ดังนั้น โต๊ะจะต้องคงสถานะ 'OCCUPIED' เสมอ ห้ามปรับเป็น 'AVAILABLE'
    // โต๊ะจะกลายเป็น 'AVAILABLE' (ว่าง) ก็ต่อเมื่อมีการชำระเงินเรียบร้อย (PAID) หรือยกเลิก (CANCELLED)
    if (order.table_id) {
      const statusUpper = updateOrderStatusDto.status.toUpperCase();
      if (['PENDING', 'COOKING', 'READY', 'SERVED'].includes(statusUpper)) {
        await this.prisma.table.update({
          where: { table_id: order.table_id },
          data: { status: 'OCCUPIED' },
        }).catch(() => {});
      } else if (['PAID', 'CANCELLED'].includes(statusUpper)) {
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
          }).catch(() => {});
        }
      }
    }

    // คืนสต็อกวัตถุดิบกรณีออเดอร์ถูกยกเลิก (CANCELLED)
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
            }).catch(() => {});
          }
        }
      }
    }

    return updated;
  }
}