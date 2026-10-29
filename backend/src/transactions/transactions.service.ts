// src/transactions/transactions.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { OrdersService } from '../orders/orders.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Stripe = require('stripe');

@Injectable()
export class TransactionsService {
  private stripe: any;

  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
      apiVersion: '2024-12-18.acacia',
    });
  }

  // บันทึกการชำระเงินปกติ (เงินสด / สแกนโอน) และเปลี่ยนสถานะ Order เป็น COMPLETED
  async create(createTransactionDto: CreateTransactionDto) {
    const { order_id, amount, payment_method } = createTransactionDto;

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

  // ==========================================================
  // PromptPay แบบโอนเข้าบัญชีร้านโดยตรง + แอดมินตรวจสอบยอดเอง
  // ==========================================================

  // ลูกค้ากด "ฉันโอนเงินแล้ว" -> สร้างรายการรอตรวจสอบ (PENDING)
  // ยอดเงินใช้ยอดจากออเดอร์ในฐานข้อมูลเสมอ ไม่เชื่อยอดที่ส่งมาจากหน้าเว็บ
  async notifyPromptPayTransfer(orderId: number, requester?: { user_id?: number; role?: string } | null) {
    const order = await this.prisma.order.findUnique({ where: { order_id: orderId } });
    if (!order) {
      throw new NotFoundException(`ไม่พบคำสั่งซื้อรหัส #${orderId}`);
    }

    // ถ้าออเดอร์ผูกกับสมาชิก ให้เฉพาะเจ้าของออเดอร์ (หรือพนักงาน) แจ้งโอนได้
    const role = String(requester?.role || '').toUpperCase();
    const isStaff = role === 'ADMIN' || role === 'KITCHEN';
    if (order.user_id && !isStaff && requester?.user_id !== order.user_id) {
      throw new ForbiddenException('ไม่สามารถแจ้งชำระเงินให้ออเดอร์ของผู้อื่นได้');
    }

    const status = String(order.status || '').toUpperCase();
    if (status === 'CANCELLED') {
      throw new BadRequestException('ออเดอร์นี้ถูกยกเลิกแล้ว');
    }

    const existing = await this.prisma.transaction.findMany({ where: { order_id: orderId } });
    if (existing.some((t) => String(t.payment_status).toUpperCase() === 'COMPLETED')) {
      throw new BadRequestException('ออเดอร์นี้ชำระเงินเรียบร้อยแล้ว');
    }

    // กดซ้ำได้ ไม่สร้างรายการซ้ำ
    const pending = existing.find(
      (t) => String(t.payment_method).toUpperCase() === 'PROMPTPAY' && String(t.payment_status).toUpperCase() === 'PENDING',
    );
    if (pending) {
      return pending;
    }

    return this.prisma.transaction.create({
      data: {
        order_id: orderId,
        amount: order.total_price,
        payment_method: 'PROMPTPAY',
        payment_status: 'PENDING',
      },
    });
  }

  // รายการโอนพร้อมเพย์ที่รอแอดมินตรวจสอบ
  async findPendingPromptPay() {
    return this.prisma.transaction.findMany({
      where: { payment_method: 'PROMPTPAY', payment_status: 'PENDING' },
      orderBy: { transaction_id: 'asc' },
      include: {
        order: {
          include: {
            table: true,
            order_items: { include: { menu: true } },
          },
        },
      },
    });
  }

  // แอดมินเช็กบัญชีธนาคารแล้วกดยืนยัน / ปฏิเสธ
  async verifyPromptPay(transactionId: number, approve: boolean) {
    const txn = await this.prisma.transaction.findUnique({
      where: { transaction_id: transactionId },
      include: { order: true },
    });
    if (!txn) {
      throw new NotFoundException(`ไม่พบรายการชำระเงิน #${transactionId}`);
    }
    if (String(txn.payment_status).toUpperCase() !== 'PENDING') {
      throw new BadRequestException(`รายการนี้ถูกตรวจสอบไปแล้ว (สถานะ: ${txn.payment_status})`);
    }

    if (!approve) {
      const rejected = await this.prisma.transaction.update({
        where: { transaction_id: transactionId },
        data: { payment_status: 'REJECTED' },
      });

      // ไม่พบยอดโอน -> ยกเลิกออเดอร์ เพื่อไม่ให้ครัวทำอาหาร/ไรเดอร์ไปส่งของที่ยังไม่ได้รับเงิน
      // ใช้ updateStatus ของ OrdersService: คืนสต็อกวัตถุดิบ, คืนโต๊ะว่าง และส่ง order_status_updated ให้ครัวทันที
      // ไม่ยกเลิกถ้าออเดอร์จบไปแล้ว หรือมีการชำระเงินช่องทางอื่นสำเร็จแล้ว
      const orderStatus = String(txn.order?.status || '').toUpperCase();
      const finishedStatuses = ['PAID', 'COMPLETED', 'CANCELLED', 'DELIVERED'];
      const otherPaid = await this.prisma.transaction.count({
        where: { order_id: txn.order_id, payment_status: 'COMPLETED' },
      });
      let orderCancelled = false;
      if (!finishedStatuses.includes(orderStatus) && otherPaid === 0) {
        await this.ordersService.updateStatus(txn.order_id, { status: 'CANCELLED' } as any);
        orderCancelled = true;
      }

      return { ...rejected, order_cancelled: orderCancelled };
    }

    const updatedTxn = await this.prisma.transaction.update({
      where: { transaction_id: transactionId },
      data: { payment_status: 'COMPLETED' },
    });

    // ออเดอร์ทานที่ร้าน: ปิดบิลเป็น PAID และคืนโต๊ะว่างเมื่อไม่มีออเดอร์ค้าง
    // ออเดอร์เดลิเวอรี่: ไม่แตะสถานะ เพื่อให้ขั้นตอนครัว/ไรเดอร์เดินต่อตามปกติ
    if (txn.order?.table_id) {
      await this.markOrderPaidAndReleaseTable(txn.order_id, txn.order.table_id);
    }

    return updatedTxn;
  }

  private async markOrderPaidAndReleaseTable(orderId: number, tableId: number) {
    await this.prisma.order.update({ where: { order_id: orderId }, data: { status: 'PAID' } });
    const remainingUnpaid = await this.prisma.order.count({
      where: {
        table_id: tableId,
        status: { in: ['PENDING', 'COOKING', 'READY', 'SERVED'] },
        order_id: { not: orderId },
      },
    });
    if (remainingUnpaid === 0) {
      await this.prisma.table
        .update({ where: { table_id: tableId }, data: { status: 'AVAILABLE' } })
        .catch(() => {});
    }
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

    // สร้าง Intent กับระบบ Stripe (รองรับทั้ง Stripe จริง และ Fallback เมื่อใช้ Test Key)
    let paymentIntent: any = null;
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
    } catch (err: any) {
      console.warn('Stripe API warning (falling back to mock intent):', err?.message);
    }

    const intentId = paymentIntent?.id || `pi_stripe_${Date.now()}`;
    const clientSecret = paymentIntent?.client_secret || `${intentId}_secret_${Math.random().toString(36).substring(7)}`;

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
      clientSecret,
      paymentIntentId: intentId,
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

    const updated = await this.prisma.order.update({
      where: { order_id: orderId },
      data: { status: 'PAID' },
    });

    // ถ้าออเดอร์มีโต๊ะ ให้เช็คว่าเหลือออเดอร์อื่นค้างอยู่หรือไม่ ถ้าไม่เหลือให้ปรับโต๊ะเป็น AVAILABLE (ว่าง)
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
        }).catch(() => {});
      }
    }

    return updated;
  }
}