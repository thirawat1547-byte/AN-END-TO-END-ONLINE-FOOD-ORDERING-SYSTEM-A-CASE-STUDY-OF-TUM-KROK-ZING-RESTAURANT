// src/transactions/transactions.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  // บันทึกการชำระเงิน และเปลี่ยนสถานะ Order เป็น COMPLETED
  async create(createTransactionDto: CreateTransactionDto) {
    const { order_id, amount, payment_method, payment_slip_url } = createTransactionDto;

    const order = await this.prisma.order.findUnique({
      where: { order_id },
    });

    if (!order) {
      throw new NotFoundException(`ไม่พบคำสั่งซื้อรหัส #${order_id}`);
    }

    if (order.status === 'COMPLETED') {
      throw new BadRequestException('คำสั่งซื้อนี้ถูกชำระเงินและปิดบิลเรียบร้อยแล้ว');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. สร้างรายการชำระเงิน
      const transaction = await tx.transaction.create({
        data: {
          order_id,
          amount,
          payment_method,
          payment_status: 'COMPLETED',
          payment_slip_url: payment_slip_url || null,
        },
      });

      // 2. ปรับสถานะคำสั่งซื้อเป็นปิดบิล (COMPLETED)
      await tx.order.update({
        where: { order_id },
        data: { status: 'COMPLETED' },
      });

      return transaction;
    });
  }

  // ดูประวัติการชำระเงินทั้งหมด
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
}