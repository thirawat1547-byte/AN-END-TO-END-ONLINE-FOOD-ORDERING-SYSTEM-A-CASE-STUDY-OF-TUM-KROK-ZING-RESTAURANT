// src/transactions/transactions.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { OrdersService } from '../orders/orders.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Stripe = require('stripe');

// ออเดอร์ที่กดจ่าย Stripe แล้วไม่จ่ายภายในเวลานี้จะถูกยกเลิกอัตโนมัติ
const UNPAID_STRIPE_TIMEOUT_MINUTES = 15;

@Injectable()
export class TransactionsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TransactionsService.name);
  private stripe: any;
  private expiredCheckTimer?: NodeJS.Timeout;
  private isCancellingExpired = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
      apiVersion: '2024-12-18.acacia',
    });
  }

  async onModuleInit() {
    await this.ensureTransactionColumns();
    // ตรวจออเดอร์ค้างจ่าย Stripe ทุก 1 นาที
    this.expiredCheckTimer = setInterval(() => void this.cancelExpiredStripeOrders(), 60_000);
  }

  onModuleDestroy() {
    if (this.expiredCheckTimer) clearInterval(this.expiredCheckTimer);
  }

  // ตรวจสอบและสร้างคอลัมน์ใหม่ (paid_at, stripe_payment_intent_id, stripe_fee) หากยังไม่มีในฐานข้อมูล
  private async ensureTransactionColumns() {
    const addColumnSafe = async (sql: string) => {
      try {
        await this.prisma.$executeRawUnsafe(sql);
      } catch (e: any) {
        // ละเว้นหากมีคอลัมน์นี้อยู่แล้วในตาราง
      }
    };

    await addColumnSafe('ALTER TABLE TRANSACTIONS ADD COLUMN stripe_payment_intent_id VARCHAR(255) NULL;');
    await addColumnSafe('ALTER TABLE TRANSACTIONS ADD COLUMN stripe_fee DECIMAL(10, 2) DEFAULT 0.00;');
    await addColumnSafe('ALTER TABLE TRANSACTIONS ADD COLUMN paid_at DATETIME NULL;');
  }

  // บันทึกการชำระเงินปกติ (เงินสด / สแกนโอน) และปรับสถานะ Order อย่างถูกต้อง
  async create(createTransactionDto: CreateTransactionDto, user?: any) {
    const { order_id, amount, payment_method, payment_status } = createTransactionDto;

    const order = await this.prisma.order.findUnique({
      where: { order_id },
    });

    if (!order) {
      throw new NotFoundException(`ไม่พบคำสั่งซื้อรหัส #${order_id}`);
    }

    if (order.status === 'COMPLETED') {
      throw new BadRequestException('คำสั่งซื้อนี้ถูกชำระเงินและปิดบิลเรียบร้อยแล้ว');
    }

    if (order.status === 'CANCELLED') {
      throw new BadRequestException('คำสั่งซื้อนี้ถูกยกเลิกแล้ว ไม่สามารถบันทึกการชำระเงินได้');
    }

    // หากมีข้อมูลผู้ใช้งาน และออเดอร์ผูกกับ user_id
    // ให้ลูกค้าชำระเงินเฉพาะออเดอร์ของตนเองได้ (ADMIN / STAFF / KITCHEN ชำระได้ทั้งหมด)
    if (user && order.user_id) {
      const role = String(user.role || '').toUpperCase();
      const isStaffOrAdmin = role === 'ADMIN' || role === 'STAFF' || role === 'KITCHEN';
      const userId = Number(user.user_id || user.userId || user.sub);
      if (!isStaffOrAdmin && userId && userId !== order.user_id) {
        throw new ForbiddenException('คุณไม่มีสิทธิ์บันทึกการชำระเงินของคำสั่งซื้อผู้อื่น');
      }
    }

    // แปลงประเภทช่องทางชำระเงินให้เป็นมาตรฐานชัดเจน:
    // ออเดอร์ที่จ่ายแบบเงินสด บันทึกช่องทางเป็น 'CASH' ชัดเจน
    let normalizedMethod = (payment_method || '').trim().toUpperCase();
    if (['CASH', 'เงินสด', 'COD', 'CASH_ON_DELIVERY'].includes(normalizedMethod)) {
      normalizedMethod = 'CASH';
    } else if (['PROMPTPAY', 'PROMPT_PAY', 'พร้อมเพย์'].includes(normalizedMethod)) {
      normalizedMethod = 'PROMPTPAY';
    } else if (['CARD', 'CREDIT_CARD', 'DEBIT_CARD', 'บัตร', 'บัตรเดบิต'].includes(normalizedMethod)) {
      normalizedMethod = 'CARD';
    }

    const finalPaymentStatus = payment_status ? payment_status.toUpperCase() : 'COMPLETED';
    const isCompleted = finalPaymentStatus === 'COMPLETED';

    return this.prisma.$transaction(async (tx) => {
      // 1. สร้างรายการชำระเงิน พร้อมบันทึก paid_at ตามเวลาจริงเมื่อ COMPLETED
      const transaction = await tx.transaction.create({
        data: {
          order_id,
          amount,
          payment_method: normalizedMethod,
          payment_status: finalPaymentStatus,
          paid_at: isCompleted ? new Date() : null,
          stripe_fee: 0,
        },
      });

      // 2. ปรับสถานะคำสั่งซื้อตามประเภทและขั้นตอนจริง:
      // - หากการชำระเงินยังเป็น PENDING (เช่น เงินสดปลายทาง / รอชำระ): ให้คงสถานะออเดอร์ไว้ตามเดิม (เช่น PENDING)
      // - หากเป็นออเดอร์จัดส่ง (DELIVERY):
      //    - ถ้ายังไม่ได้เริ่มทำ (PENDING) ให้ปรับเป็น PAID (ชำระเงินแล้ว รอครัวปรุง)
      //    - ถ้าครัวกำลังปรุง (COOKING), ปรุงเสร็จแล้ว (READY) หรือกำลังนำส่ง (IN_DELIVERY) ให้คงสถานะเดิม
      //    - ถ้าจัดส่งสำเร็จแล้ว (DELIVERED) ให้ปรับเป็น COMPLETED
      // - หากเป็นออเดอร์ทานที่ร้าน (มี table_id): ปรับเป็น PAID และคืนโต๊ะว่างเมื่อปิดบิลหมด
      // - กรณีอื่นๆ (เช่น ออเดอร์ที่ปิดงานเรียบร้อย): ปรับเป็น COMPLETED
      let nextStatus = order.status;

      if (finalPaymentStatus === 'COMPLETED') {
        if (order.order_type === 'DELIVERY') {
          if (order.status === 'PENDING') {
            nextStatus = 'PAID';
          } else if (['COOKING', 'READY', 'IN_DELIVERY'].includes(order.status)) {
            nextStatus = order.status;
          } else if (order.status === 'DELIVERED') {
            nextStatus = 'COMPLETED';
          } else {
            nextStatus = 'PAID';
          }
        } else if (order.table_id) {
          nextStatus = 'PAID';
        } else {
          nextStatus = 'COMPLETED';
        }
      }

      if (nextStatus !== order.status) {
        await tx.order.update({
          where: { order_id },
          data: { status: nextStatus },
        });
      }

      // ถ้าเป็นออเดอร์มีโต๊ะ และชำระเงินเสร็จสิ้น ตรวจสอบและคืนสถานะโต๊ะว่างเมื่อไม่มีออเดอร์ค้าง
      if (order.table_id && finalPaymentStatus === 'COMPLETED') {
        const remainingUnpaid = await tx.order.count({
          where: {
            table_id: order.table_id,
            status: { in: ['PENDING', 'COOKING', 'READY', 'SERVED'] },
            order_id: { not: order_id },
          },
        });
        if (remainingUnpaid === 0) {
          await tx.table
            .update({
              where: { table_id: order.table_id },
              data: { status: 'AVAILABLE' },
            })
            .catch(() => {});
        }
      }

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
    const isStaff = role === 'ADMIN' || role === 'KITCHEN' || role === 'STAFF';
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
        paid_at: null,
        stripe_fee: 0,
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
      data: {
        payment_status: 'COMPLETED',
        paid_at: new Date(),
      },
    });

    // ออเดอร์ทานที่ร้าน: ปิดบิลเป็น PAID และคืนโต๊ะว่างเมื่อไม่มีออเดอร์ค้าง
    // ออเดอร์เดลิเวอรี่: ปรับสถานะเป็น PAID หากเดิมยังเป็น PENDING
    if (txn.order?.table_id) {
      await this.markOrderPaidAndReleaseTable(txn.order_id, txn.order.table_id);
    } else if (txn.order?.order_type === 'DELIVERY' && txn.order.status === 'PENDING') {
      await this.prisma.order.update({
        where: { order_id: txn.order_id },
        data: { status: 'PAID' },
      });
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

  // ==========================================================
  // Stripe Payment Integration
  // ==========================================================

  // สร้าง Payment Intent สำหรับ Stripe (ส่ง clientSecret ให้หน้าบ้านไปเปิดฟอร์มชำระเงิน)
  async createStripeIntent(orderId: number, user?: any) {
    const order = await this.prisma.order.findUnique({
      where: { order_id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`ไม่พบคำสั่งซื้อรหัส #${orderId}`);
    }

    if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
      throw new BadRequestException(`ไม่สามารถสร้างรายการชำระเงินสำหรับคำสั่งซื้อที่มีสถานะ ${order.status}`);
    }

    // หากมีข้อมูลผู้ใช้และออเดอร์ผูกกับ User ให้ตรวจสอบว่าเป็นเจ้าของหรือพนักงานร้าน
    if (user && order.user_id) {
      const role = String(user.role || '').toUpperCase();
      const isStaffOrAdmin = role === 'ADMIN' || role === 'STAFF' || role === 'KITCHEN';
      const userId = Number(user.user_id || user.userId || user.sub);
      if (!isStaffOrAdmin && userId && userId !== order.user_id) {
        throw new ForbiddenException('คุณไม่มีสิทธิ์สร้างรายการชำระเงินสำหรับคำสั่งซื้อของผู้อื่น');
      }
    }

    const amountInSatang = Math.round(Number(order.total_price) * 100);
    if (amountInSatang <= 0) {
      throw new BadRequestException('ยอดชำระต้องมากกว่า 0 บาท');
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey || stripeKey.includes('placeholder')) {
      throw new InternalServerErrorException('ระบบชำระเงิน Stripe ยังไม่ได้ถูกตั้งค่าคีย์ (STRIPE_SECRET_KEY)');
    }

    let paymentIntent: any;
    try {
      paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInSatang,
        currency: 'thb',
        payment_method_types: ['card', 'promptpay'],
        metadata: {
          order_id: order.order_id.toString(),
        },
      });
    } catch (err: any) {
      throw new BadRequestException(
        `ไม่สามารถสร้าง PaymentIntent กับ Stripe ได้: ${err?.message || 'ข้อผิดพลาดจาก Stripe API'}`,
      );
    }

    if (!paymentIntent || !paymentIntent.client_secret) {
      throw new InternalServerErrorException('ไม่ได้รับ client_secret จาก Stripe API');
    }

    // บันทึกรายการลงตารางรอการชำระ พร้อมเก็บ stripe_payment_intent_id เพื่อใช้จับคู่
    await this.prisma.transaction.create({
      data: {
        order_id: order.order_id,
        amount: order.total_price,
        payment_method: 'STRIPE',
        payment_status: 'PENDING',
        stripe_payment_intent_id: paymentIntent.id,
        stripe_fee: 0,
        paid_at: null,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: order.total_price,
      currency: 'THB',
    };
  }

  // ยืนยันสถานะการชำระเงิน Stripe โดยตรวจสอบกับ Stripe API จริง
  async confirmStripePayment(orderId: number, paymentIntentId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { order_id: orderId },
      include: { transaction: true },
    });

    if (!order) {
      throw new NotFoundException(`ไม่พบคำสั่งซื้อรหัส #${orderId}`);
    }

    if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
      throw new BadRequestException(`คำสั่งซื้อนี้มีสถานะ ${order.status} ไม่สามารถดำเนินการชำระเงินซ้ำได้`);
    }

    // หากไม่ได้ระบุ paymentIntentId ให้ค้นหาจาก transaction ที่บันทึกไว้ของออเดอร์นี้
    let resolvedIntentId = paymentIntentId;
    if (!resolvedIntentId) {
      const pendingTxn = await this.prisma.transaction.findFirst({
        where: {
          order_id: orderId,
          stripe_payment_intent_id: { not: null },
        },
        orderBy: { transaction_id: 'desc' },
      });
      if (pendingTxn?.stripe_payment_intent_id) {
        resolvedIntentId = pendingTxn.stripe_payment_intent_id;
      }
    }

    // ต้องมี PaymentIntent เสมอ ไม่อย่างนั้นจะไม่มีอะไรยืนยันว่าลูกค้าจ่ายจริง
    if (!resolvedIntentId) {
      throw new BadRequestException('ไม่พบรายการชำระเงิน Stripe ของคำสั่งซื้อนี้');
    }

    let channel = 'CARD';
    let stripeFee = 0;

    // หากมี paymentIntentId ให้ตรวจสอบสถานะกับ Stripe API จริง
    if (resolvedIntentId) {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey || stripeKey.includes('placeholder')) {
        throw new InternalServerErrorException('ระบบชำระเงิน Stripe ยังไม่ได้ถูกตั้งค่าคีย์ (STRIPE_SECRET_KEY)');
      }

      let intent: any;
      try {
        intent = await this.stripe.paymentIntents.retrieve(resolvedIntentId, {
          expand: ['payment_method', 'latest_charge.balance_transaction'],
        });
      } catch (err: any) {
        throw new BadRequestException(
          `ไม่สามารถตรวจสอบสถานะกับ Stripe ได้: ${err?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล PaymentIntent'}`,
        );
      }

      // PaymentIntent ต้องเป็นของออเดอร์นี้ (กันเอารายการที่จ่ายแล้วของออเดอร์อื่นมายืนยันแทน)
      if (String(intent.metadata?.order_id ?? '') !== String(orderId)) {
        throw new BadRequestException('รายการชำระเงิน Stripe นี้ไม่ใช่ของคำสั่งซื้อนี้');
      }

      // ดึงข้อมูล Payment Method หรือ Card Details จาก Stripe API
      let card: any = null;
      let paymentMethod = intent.payment_method;

      if (typeof paymentMethod === 'string') {
        try {
          paymentMethod = await this.stripe.paymentMethods.retrieve(paymentMethod);
        } catch (pmErr: any) {
          this.logger.warn(`ไม่สามารถดึงข้อมูล Payment Method (${paymentMethod}) ได้: ${pmErr?.message}`);
        }
      }

      if (paymentMethod && typeof paymentMethod === 'object') {
        card = paymentMethod.card;
      }

      // ตรวจสอบ fallback จาก charges data หากมี
      if (!card && intent.charges?.data?.[0]?.payment_method_details?.card) {
        card = intent.charges.data[0].payment_method_details.card;
      }

      // 1. ตรวจสอบประเภทช่องทางชำระเงินจาก Payment Method:
      //    - หาก payment_method.type === 'card' ให้บันทึกช่องทางเป็น 'CARD'
      //    - หาก payment_method.type === 'promptpay' ให้บันทึกช่องทางเป็น 'PROMPTPAY'
      //    - (ยกเลิกการบันทึกรวมเป็น 'STRIPE' อย่างเดียว)
      const pmType =
        paymentMethod?.type ||
        intent.charges?.data?.[0]?.payment_method_details?.type ||
        intent.payment_method_types?.[0];

      if (pmType === 'promptpay') {
        channel = 'PROMPTPAY';
      } else if (pmType === 'card') {
        channel = 'CARD';
      } else {
        channel = 'CARD';
      }

      // 2. ตรวจสอบประเภทบัตร: ต้องเป็นบัตรเดบิต (Debit Card) เท่านั้น (เฉพาะกรณีชำระผ่านบัตร CARD)
      const isCard = channel === 'CARD' || paymentMethod?.type === 'card' || Boolean(card);
      if (isCard) {
        if (!card || card.funding !== 'debit') {
          // สั่งยกเลิก/ไม่ตัดเงิน (Cancel Intent หรือ Refund หากถูกตัดเงินไปแล้ว)
          try {
            if (
              ['requires_payment_method', 'requires_capture', 'requires_confirmation', 'requires_action'].includes(
                intent.status,
              )
            ) {
              await this.stripe.paymentIntents.cancel(resolvedIntentId);
            } else if (intent.status === 'succeeded') {
              await this.stripe.refunds.create({
                payment_intent: resolvedIntentId,
                reason: 'requested_by_customer',
              });
            }
          } catch (cancelErr: any) {
            this.logger.warn(`ไม่สามารถยกเลิก/คืนเงิน PaymentIntent #${resolvedIntentId} ได้: ${cancelErr?.message}`);
          }

          throw new BadRequestException('ระบบรองรับเฉพาะบัตรเดบิตเท่านั้น กรุณาใช้บัตรเดบิตในการชำระเงิน');
        }
      }

      if (intent.status !== 'succeeded') {
        throw new BadRequestException(`การชำระเงินยังไม่สำเร็จในระบบ Stripe (สถานะปัจจุบัน: ${intent.status})`);
      }

      const expectedSatang = Math.round(Number(order.total_price) * 100);
      if (Number(intent.amount_received ?? intent.amount) < expectedSatang) {
        throw new BadRequestException('ยอดที่ชำระผ่าน Stripe น้อยกว่ายอดคำสั่งซื้อ');
      }

      // 3. คำนวณและบันทึกค่าธรรมเนียม Stripe ลง stripe_fee:
      //    - ดึงค่าธรรมเนียมจาก Stripe Charge (latest_charge.balance_transaction.fee หรือ expand balance_transaction)
      //    - แปลงหน่วยจากสตางค์เป็นบาท โดยนำมาหาร 100 (เช่น 350 สตางค์ = 3.50 บาท) บันทึกลงคอลัมน์ stripe_fee
      //    - หากดึงค่าธรรมเนียมไม่สำเร็จ ให้ fallback เป็น 0
      try {
        let feeSatang: number | undefined;

        // ดึงจาก latest_charge.balance_transaction.fee
        const latestCharge = intent.latest_charge;
        if (latestCharge && typeof latestCharge === 'object') {
          if (latestCharge.balance_transaction && typeof latestCharge.balance_transaction === 'object') {
            feeSatang = latestCharge.balance_transaction.fee;
          } else if (typeof latestCharge.balance_transaction === 'string') {
            const bt = await this.stripe.balanceTransactions.retrieve(latestCharge.balance_transaction);
            feeSatang = bt?.fee;
          }
        } else if (typeof latestCharge === 'string') {
          const ch = await this.stripe.charges.retrieve(latestCharge, {
            expand: ['balance_transaction'],
          });
          if (ch.balance_transaction && typeof ch.balance_transaction === 'object') {
            feeSatang = ch.balance_transaction.fee;
          } else if (typeof ch.balance_transaction === 'string') {
            const bt = await this.stripe.balanceTransactions.retrieve(ch.balance_transaction);
            feeSatang = bt?.fee;
          }
        }

        // Fallback จาก intent.charges.data[0]
        if (feeSatang === undefined && intent.charges?.data?.[0]) {
          const ch = intent.charges.data[0];
          if (ch.balance_transaction && typeof ch.balance_transaction === 'object') {
            feeSatang = ch.balance_transaction.fee;
          } else if (typeof ch.balance_transaction === 'string') {
            const bt = await this.stripe.balanceTransactions.retrieve(ch.balance_transaction);
            feeSatang = bt?.fee;
          }
        }

        if (typeof feeSatang === 'number' && !isNaN(feeSatang) && feeSatang >= 0) {
          stripeFee = feeSatang / 100;
        } else {
          stripeFee = 0;
        }
      } catch (feeErr: any) {
        this.logger.warn(`ไม่สามารถดึงค่าธรรมเนียม Stripe ได้: ${feeErr?.message}`);
        stripeFee = 0;
      }
    }

    // อัปเดตรายการธุรกรรมเป็น COMPLETED พร้อมบันทึก paid_at, stripe_payment_intent_id, stripe_fee
    const existingTxn = await this.prisma.transaction.findFirst({
      where: {
        order_id: orderId,
        OR: [
          ...(resolvedIntentId ? [{ stripe_payment_intent_id: resolvedIntentId }] : []),
          { payment_method: { in: ['STRIPE', 'CARD', 'PROMPTPAY'] }, payment_status: 'PENDING' },
          { payment_method: 'STRIPE' },
        ],
      },
      orderBy: { transaction_id: 'desc' },
    });

    const txnUpdateData = {
      payment_method: channel,
      payment_status: 'COMPLETED',
      paid_at: new Date(),
      stripe_payment_intent_id: resolvedIntentId || existingTxn?.stripe_payment_intent_id || null,
      stripe_fee: stripeFee,
    };

    if (existingTxn) {
      await this.prisma.transaction.update({
        where: { transaction_id: existingTxn.transaction_id },
        data: txnUpdateData,
      });
    } else {
      await this.prisma.transaction.create({
        data: {
          order_id: orderId,
          amount: order.total_price,
          ...txnUpdateData,
        },
      });
    }

    // ปรับสถานะออเดอร์ตามขั้นตอนจริง:
    // หากเป็น DELIVERY:
    // - ถ้ายังไม่เริ่มทำ (PENDING) ปรับเป็น PAID
    // - ถ้าครัวกำลังปรุง (COOKING), READY, IN_DELIVERY ให้คงสถานะเดิม
    // - ถ้าจัดส่งเสร็จแล้ว (DELIVERED) ปรับเป็น COMPLETED
    let nextStatus = 'PAID';
    if (order.order_type === 'DELIVERY') {
      if (['COOKING', 'READY', 'IN_DELIVERY'].includes(order.status)) {
        nextStatus = order.status;
      } else if (order.status === 'DELIVERED') {
        nextStatus = 'COMPLETED';
      } else {
        nextStatus = 'PAID';
      }
    }

    const updated = await this.prisma.order.update({
      where: { order_id: orderId },
      data: { status: nextStatus },
    });

    // ถ้าออเดอร์มีโต๊ะ ให้เช็คว่าเหลือออเดอร์อื่นค้างอยู่หรือไม่ ถ้าไม่เหลือให้ปรับโต๊ะเป็น AVAILABLE
    if (order.table_id) {
      const remainingUnpaid = await this.prisma.order.count({
        where: {
          table_id: order.table_id,
          status: { in: ['PENDING', 'COOKING', 'READY', 'SERVED'] },
          order_id: { not: orderId },
        },
      });
      if (remainingUnpaid === 0) {
        await this.prisma.table
          .update({
            where: { table_id: order.table_id },
            data: { status: 'AVAILABLE' },
          })
          .catch(() => {});
      }
    }

    return updated;
  }

  // Webhook จาก Stripe: รับเฉพาะ event ที่ลายเซ็นถูกต้องเท่านั้น
  // ไม่มี secret / ไม่มีลายเซ็น / ลายเซ็นผิด = ปฏิเสธทั้งหมด (กันคนยิง event ปลอมให้ออเดอร์กลายเป็นจ่ายแล้ว)
  async handleStripeWebhook(rawBody: Buffer, signature?: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret || webhookSecret.includes('placeholder')) {
      this.logger.error('ยังไม่ได้ตั้งค่า STRIPE_WEBHOOK_SECRET จึงปฏิเสธ webhook ทุกรายการ');
      throw new ServiceUnavailableException('ยังไม่ได้ตั้งค่า Stripe webhook secret');
    }
    if (!signature || !Buffer.isBuffer(rawBody)) {
      throw new BadRequestException('ไม่พบ Stripe signature หรือ raw body');
    }

    let event: any;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      this.logger.error(`Stripe Webhook Signature Verification Failed: ${err.message}`);
      throw new BadRequestException(`Stripe Webhook Signature Verification Failed: ${err.message}`);
    }

    this.logger.log(`Processing Stripe Webhook event: ${event?.type} (ID: ${event?.id})`);

    const intent = event.data?.object;
    const intentId: string | undefined = intent?.id;

    // 1. จ่ายสำเร็จ: ยืนยันกับ Stripe API อีกครั้งผ่าน confirmStripePayment (เช็คสถานะ ยอดเงิน และออเดอร์ที่ผูกไว้)
    if (event.type === 'payment_intent.succeeded' && intentId) {
      const orderId = await this.resolveOrderIdForIntent(intent);
      if (!orderId) {
        this.logger.warn(`ไม่พบออเดอร์ที่ผูกกับ PaymentIntent ${intentId}`);
        return { received: true, event: event.type };
      }
      try {
        await this.confirmStripePayment(orderId, intentId);
        return { received: true, status: 'COMPLETED', order_id: orderId };
      } catch (err: any) {
        // ยืนยันไม่ผ่าน (เช่น ออเดอร์ถูกยกเลิกไปแล้ว หรือใช้บัตรเครดิต) ห้ามบันทึกว่าจ่ายแล้ว
        this.logger.warn(`ไม่บันทึกการชำระของออเดอร์ #${orderId} (${intentId}): ${err?.message}`);
        await this.refundIfOrderCancelled(orderId, intentId);
        return { received: true, status: 'IGNORED', order_id: orderId };
      }
    }

    // 2. จ่ายไม่สำเร็จ / ถูกยกเลิก
    if (
      (event.type === 'payment_intent.payment_failed' || event.type === 'payment_intent.canceled') &&
      intentId
    ) {
      this.logger.warn(`PaymentIntent #${intentId} failed or canceled (type: ${event.type})`);
      await this.prisma.transaction.updateMany({
        where: { stripe_payment_intent_id: intentId, payment_status: 'PENDING' },
        data: { payment_status: 'FAILED' },
      });
      return { received: true, status: 'FAILED', event: event.type };
    }

    return { received: true, event: event.type };
  }

  // หาออเดอร์ของ PaymentIntent: ใช้รายการในฐานข้อมูลก่อน ถ้าไม่มีค่อยใช้ metadata (event ผ่านการตรวจลายเซ็นแล้ว)
  private async resolveOrderIdForIntent(intent: any): Promise<number | null> {
    const txn = await this.prisma.transaction.findFirst({
      where: { stripe_payment_intent_id: intent?.id },
      select: { order_id: true },
    });
    if (txn) return txn.order_id;
    const fromMeta = Number(intent?.metadata?.order_id);
    return Number.isInteger(fromMeta) && fromMeta > 0 ? fromMeta : null;
  }

  // ลูกค้าจ่ายเข้ามาหลังออเดอร์ถูกยกเลิกแล้ว: คืนเงินอัตโนมัติ
  private async refundIfOrderCancelled(orderId: number, intentId: string) {
    const order = await this.prisma.order.findUnique({
      where: { order_id: orderId },
      select: { status: true },
    });
    if (order?.status !== 'CANCELLED') return;
    try {
      await this.stripe.refunds.create(
        { payment_intent: intentId, reason: 'requested_by_customer' },
        { idempotencyKey: `refund-cancelled-${intentId}` },
      );
      await this.prisma.transaction.updateMany({
        where: { stripe_payment_intent_id: intentId },
        data: { payment_status: 'REFUNDED' },
      });
      this.logger.warn(`คืนเงิน PaymentIntent ${intentId} เพราะออเดอร์ #${orderId} ถูกยกเลิกไปแล้ว`);
    } catch (err: any) {
      this.logger.error(`คืนเงิน PaymentIntent ${intentId} ไม่สำเร็จ: ${err?.message}`);
    }
  }

  // ==========================================================
  // ยกเลิกออเดอร์เดลิเวอรีที่สร้างรายการจ่าย Stripe แล้วไม่จ่ายภายใน 15 นาที
  // (ไม่แตะออเดอร์ที่โต๊ะ เงินสด หรือพร้อมเพย์แบบแอดมินตรวจสลิป)
  // ==========================================================
  private async cancelExpiredStripeOrders() {
    if (this.isCancellingExpired) return;
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey || stripeKey.includes('placeholder')) return;

    this.isCancellingExpired = true;
    try {
      const cutoff = new Date(Date.now() - UNPAID_STRIPE_TIMEOUT_MINUTES * 60_000);
      const candidates = await this.prisma.order.findMany({
        where: {
          table_id: null,
          status: { notIn: ['PAID', 'COMPLETED', 'CANCELLED', 'DELIVERED'] },
          transaction: {
            some: { stripe_payment_intent_id: { not: null } },
            // มีรายการที่จ่ายสำเร็จแล้ว หรือมีรายการแบบอื่น (เงินสด/โอนตรวจสลิป) = ไม่ยกเลิก
            none: {
              OR: [
                { payment_status: { in: ['COMPLETED', 'REFUNDED'] } },
                { stripe_payment_intent_id: null },
              ],
            },
          },
        },
        select: {
          order_id: true,
          transaction: {
            where: { stripe_payment_intent_id: { not: null } },
            orderBy: { created_at: 'desc' },
            select: { stripe_payment_intent_id: true, created_at: true },
          },
        },
        take: 50,
      });

      for (const order of candidates) {
        // นับเวลาจากครั้งล่าสุดที่ลูกค้ากดจ่าย (กดจ่ายใหม่ = เริ่มนับใหม่)
        const latest = order.transaction[0];
        if (!latest || latest.created_at > cutoff) continue;

        try {
          await this.cancelUnpaidStripeOrder(
            order.order_id,
            order.transaction.map((t) => t.stripe_payment_intent_id as string),
          );
        } catch (err: any) {
          this.logger.error(`ยกเลิกออเดอร์ค้างจ่าย #${order.order_id} ไม่สำเร็จ: ${err?.message}`);
        }
      }
    } catch (err: any) {
      this.logger.error(`ตรวจออเดอร์ค้างจ่าย Stripe ไม่สำเร็จ: ${err?.message}`);
    } finally {
      this.isCancellingExpired = false;
    }
  }

  private async cancelUnpaidStripeOrder(orderId: number, intentIds: string[]) {
    // ปิด PaymentIntent ที่ Stripe ก่อน เพื่อไม่ให้ลูกค้าสแกนจ่ายได้หลังยกเลิก
    for (const intentId of [...new Set(intentIds)]) {
      const intent = await this.stripe.paymentIntents.retrieve(intentId);
      if (intent.status === 'succeeded') {
        // จ่ายแล้วแต่ webhook ยังไม่มา: ยืนยันการชำระแทนการยกเลิก
        await this.confirmStripePayment(orderId, intentId);
        return;
      }
      if (intent.status === 'processing') {
        return; // กำลังตัดเงิน รอรอบถัดไป
      }
      if (intent.status !== 'canceled') {
        try {
          await this.stripe.paymentIntents.cancel(intentId);
        } catch (err: any) {
          // ระหว่างนั้นลูกค้าอาจจ่ายสำเร็จพอดี: ข้ามไปก่อน รอบถัดไปจะเห็นเป็น succeeded
          this.logger.warn(`ยกเลิก PaymentIntent ${intentId} ไม่สำเร็จ: ${err?.message}`);
          return;
        }
      }
    }

    await this.prisma.transaction.updateMany({
      where: { order_id: orderId, stripe_payment_intent_id: { in: intentIds }, payment_status: 'PENDING' },
      data: { payment_status: 'FAILED' },
    });
    // ใช้ updateStatus เดิม: คืนสต็อก ปิดงานไรเดอร์ และแจ้งหน้าจอทุกฝั่งผ่าน socket
    await this.ordersService.updateStatus(orderId, { status: 'CANCELLED' } as any);
    this.logger.warn(
      `ยกเลิกออเดอร์ #${orderId} อัตโนมัติ: ไม่ชำระผ่าน Stripe ภายใน ${UNPAID_STRIPE_TIMEOUT_MINUTES} นาที`,
    );
  }

  // สำหรับทดสอบ Flow ในหน้าแอดมิน/โต๊ะ
  async confirmStripePaymentTest(orderId: number) {
    return this.confirmStripePayment(orderId);
  }
}
