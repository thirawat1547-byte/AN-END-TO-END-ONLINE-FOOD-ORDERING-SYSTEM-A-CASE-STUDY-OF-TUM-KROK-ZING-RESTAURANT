// src/transactions/transactions.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Stripe = require('stripe');

@Injectable()
export class TransactionsService {
  private stripe: any;

  constructor(private readonly prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
      apiVersion: '2024-12-18.acacia',
    });
  }

  // บันทึกการชำระเงินปกติ (เงินสด / สแกนโอน) และเปลี่ยนสถานะ Order เป็น COMPLETED
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

  // สร้าง Payment Intent สำหรับ Stripe (ส่ง clientSecret ให้หน้าบ้านไปเปิดฟอร์มชำระเงิน)
  async createStripeIntent(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { order_id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`ไม่พบคำสั่งซื้อรหัส #${orderId}`);
    }

    const amountInSatang = Math.round(Number(order.total_price) * 100);

    if (amountInSatang <= 0) {
      throw new BadRequestException('ยอดชำระต้องมากกว่า 0 บาท');
    }

    // สร้าง Intent กับระบบ Stripe
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInSatang,
      currency: 'thb',
      payment_method_types: ['card', 'promptpay'],
      metadata: {
        order_id: order.order_id.toString(),
      },
    });

    // บันทึกรายการลงตารางรอการชำระ
    await this.prisma.transaction.create({
      data: {
        order_id: order.order_id,
        amount: order.total_price,
        payment_method: 'STRIPE',
        payment_status: 'PENDING',
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: order.total_price,
      currency: 'THB',
    };
  }

  // จำลองการกดยืนยันชำระเงินสำเร็จ (สำหรับทดสอบระบบ)
  async confirmStripePaymentTest(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { order_id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`ไม่พบคำสั่งซื้อรหัส #${orderId}`);
    }

    await this.prisma.transaction.updateMany({
      where: { order_id: orderId },
      data: { payment_status: 'COMPLETED' },
    });

    return this.prisma.order.update({
      where: { order_id: orderId },
      data: { status: 'PAID' },
    });
  }
}