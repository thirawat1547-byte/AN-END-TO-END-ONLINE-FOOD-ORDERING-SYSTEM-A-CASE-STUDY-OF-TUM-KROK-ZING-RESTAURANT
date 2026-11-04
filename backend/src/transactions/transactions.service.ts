// src/transactions/transactions.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { OrdersService } from '../orders/orders.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Stripe = require('stripe');

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);
  private stripe: any;

  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
      apiVersion: '2024-12-18.acacia',
    });
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

    const finalPaymentStatus = payment_status ? payment_status.toUpperCase() : 'COMPLETED';

    return this.prisma.$transaction(async (tx) => {
      // 1. สร้างรายการชำระเงิน
      const transaction = await tx.transaction.create({
        data: {
          order_id,
          amount,
          payment_method,
          payment_status: finalPaymentStatus,
        },
      });

      // 2. ปรับสถานะคำสั่งซื้อตามประเภทและขั้นตอนจริง:
      // - หากการชำระเงินยังเป็น PENDING (เช่น เงินสดปลายทาง / รอชำระ): ให้คงสถานะออเดอร์ไว้ตามเดิม (เช่น PENDING)
      // - หากเป็นออเดอร์จัดส่ง (DELIVERY):
      //    - ถ้ายังไม่ได้เริ่มทำ (PENDING) ให้ปรับเป็น PAID (ชำระเงินแล้ว รอครัวปรุง)
      //    - ถ้าครัวกำลังปรุง (COOKING), ปรุงเสร็จแล้ว (READY) หรือกำลังนำส่ง (IN_DELIVERY) ให้คงสถานะเดิม
      //    - ถ้าจัดส่งสำเร็จแล้ว (DELIVERED) ให้ปรับเป็น COMPLETED
      // - หากเป็นออเดอร์ทานที่ร้าน (มี table_id): ปรับเป็น PAID และคืนโต๊ะว่างเมื่อปิดบิลหมด
      // - กรณีอื่นๆ (เช่น ซื้อกลับบ้านที่รับของเรียบร้อย): ปรับเป็น COMPLETED
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

    // บันทึกรายการลงตารางรอการชำระ (เฉพาะเมื่อสร้าง Stripe PaymentIntent สำเร็จจริง)
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

    // หากมีการระบุ paymentIntentId ให้ตรวจสอบสถานะกับ Stripe API จริง
    if (paymentIntentId) {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey || stripeKey.includes('placeholder')) {
        throw new InternalServerErrorException('ระบบชำระเงิน Stripe ยังไม่ได้ถูกตั้งค่าคีย์ (STRIPE_SECRET_KEY)');
      }

      let intent: any;
      try {
        intent = await this.stripe.paymentIntents.retrieve(paymentIntentId, {
          expand: ['payment_method'],
        });
      } catch (err: any) {
        throw new BadRequestException(
          `ไม่สามารถตรวจสอบสถานะกับ Stripe ได้: ${err?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล PaymentIntent'}`,
        );
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

      // ตรวจสอบประเภทบัตร: ต้องเป็นบัตรเดบิต (Debit Card) เท่านั้น
      const isCard = paymentMethod?.type === 'card' || Boolean(card);
      if (isCard) {
        if (!card || card.funding !== 'debit') {
          // สั่งยกเลิก/ไม่ตัดเงิน (Cancel Intent หรือ Refund หากถูกตัดเงินไปแล้ว)
          try {
            if (
              ['requires_payment_method', 'requires_capture', 'requires_confirmation', 'requires_action'].includes(
                intent.status,
              )
            ) {
              await this.stripe.paymentIntents.cancel(paymentIntentId);
            } else if (intent.status === 'succeeded') {
              await this.stripe.refunds.create({
                payment_intent: paymentIntentId,
                reason: 'requested_by_customer',
              });
            }
          } catch (cancelErr: any) {
            this.logger.warn(`ไม่สามารถยกเลิก/คืนเงิน PaymentIntent #${paymentIntentId} ได้: ${cancelErr?.message}`);
          }

          throw new BadRequestException('ระบบรองรับเฉพาะบัตรเดบิตเท่านั้น กรุณาใช้บัตรเดบิตในการชำระเงิน');
        }
      }

      if (intent.status !== 'succeeded') {
        throw new BadRequestException(`การชำระเงินยังไม่สำเร็จในระบบ Stripe (สถานะปัจจุบัน: ${intent.status})`);
      }
    }

    // อัปเดตรายการธุรกรรมเป็น COMPLETED
    const existingTxn = await this.prisma.transaction.findFirst({
      where: { order_id: orderId, payment_method: 'STRIPE' },
      orderBy: { transaction_id: 'desc' },
    });

    if (existingTxn) {
      await this.prisma.transaction.update({
        where: { transaction_id: existingTxn.transaction_id },
        data: { payment_status: 'COMPLETED' },
      });
    } else {
      await this.prisma.transaction.create({
        data: {
          order_id: orderId,
          amount: order.total_price,
          payment_method: 'STRIPE',
          payment_status: 'COMPLETED',
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

  // สำหรับทดสอบ Flow ในหน้าแอดมิน/โต๊ะ
  async confirmStripePaymentTest(orderId: number) {
    return this.confirmStripePayment(orderId);
  }
}
