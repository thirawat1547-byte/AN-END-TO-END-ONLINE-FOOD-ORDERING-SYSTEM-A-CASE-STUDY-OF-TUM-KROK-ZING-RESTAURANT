// src/chatbot/customer-ai-tools.ts
// เครื่องมือ (Function Calling) ฝั่งลูกค้า: ให้ Gemini เช็กสถานะออเดอร์ "ของลูกค้าคนนั้นเท่านั้น"
// - ลูกค้าที่ล็อกอิน: เห็นเฉพาะออเดอร์ที่ user_id ตรงกับ token
// - ลูกค้าที่โต๊ะ (QR ไม่ล็อกอิน): เห็นเฉพาะออเดอร์ที่ยังเปิดอยู่ของโต๊ะนั้น โดยไม่แสดงข้อมูลส่วนตัว
// ขอบเขตผู้ใช้ถูกกำหนดจากฝั่งเซิร์ฟเวอร์ ไม่ได้มาจากอาร์กิวเมนต์ที่โมเดลส่งมา จึงดูออเดอร์คนอื่นไม่ได้
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

const TZ = 'Asia/Bangkok';
const fmt = (d?: Date | null) =>
  d
    ? new Intl.DateTimeFormat('sv-SE', {
        timeZone: TZ,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d)
    : null;
const num = (v: unknown) => Number(v ?? 0) || 0;
const mins = (a?: Date | null, b: Date = new Date()) => (a ? Math.max(0, Math.round((b.getTime() - a.getTime()) / 60000)) : null);

const ORDER_STATUS_TH: Record<string, string> = {
  PENDING: 'รับออเดอร์แล้ว รอครัวเริ่มทำ',
  CONFIRMED: 'ยืนยันออเดอร์แล้ว',
  COOKING: 'ครัวกำลังปรุงอาหาร',
  READY: 'อาหารทำเสร็จแล้ว รอเสิร์ฟ/รอไรเดอร์รับ',
  SERVED: 'เสิร์ฟถึงโต๊ะแล้ว',
  IN_DELIVERY: 'ไรเดอร์กำลังนำส่ง',
  DELIVERING: 'ไรเดอร์กำลังนำส่ง',
  DELIVERED: 'ส่งถึงแล้ว',
  PAID: 'ชำระเงินแล้ว',
  COMPLETED: 'เสร็จสมบูรณ์',
  CANCELLED: 'ยกเลิกแล้ว',
};
const DELIVERY_STATUS_TH: Record<string, string> = {
  WAITING_RIDER: 'กำลังหาไรเดอร์',
  ASSIGNED: 'มีไรเดอร์รับงานแล้ว กำลังไปรับอาหาร',
  PICKED_UP: 'ไรเดอร์รับอาหารแล้ว',
  DELIVERING: 'ไรเดอร์กำลังนำส่ง',
  DELIVERED: 'ส่งถึงแล้ว',
  CANCELLED: 'ยกเลิกการจัดส่ง',
};
const PAYMENT_STATUS_TH: Record<string, string> = {
  PENDING: 'รอชำระเงิน',
  COMPLETED: 'ชำระเงินสำเร็จ',
  FAILED: 'ชำระเงินไม่สำเร็จ',
  REFUNDED: 'คืนเงินแล้ว',
};
const OPEN_STATUSES = ['PENDING', 'CONFIRMED', 'COOKING', 'READY', 'SERVED', 'IN_DELIVERY', 'DELIVERING'];

export type CustomerScope = { userId?: number | null; tableNumber?: string | null };

export const CUSTOMER_TOOL_DECLARATIONS = [
  {
    name: 'get_my_orders',
    description:
      'ดูสถานะออเดอร์ของลูกค้าที่กำลังคุยอยู่ (เฉพาะของลูกค้าคนนี้เท่านั้น): สถานะครัว, คิวก่อนหน้า, เวลาที่รอมาแล้ว, รายการอาหาร, ยอดเงิน, สถานะชำระเงิน และสถานะการจัดส่ง/ไรเดอร์',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        order_id: { type: 'integer', description: 'รหัสออเดอร์ที่ลูกค้าถามถึง (ไม่บังคับ)' },
        include_past: { type: 'boolean', description: 'true = รวมออเดอร์ที่เสร็จแล้ว/ยกเลิกล่าสุดด้วย (ค่าเริ่มต้นเฉพาะที่ยังไม่เสร็จ)' },
      },
    },
  },
];

export class CustomerAiTools {
  private readonly logger = new Logger('CustomerAiTools');
  constructor(private readonly prisma: PrismaService) {}

  async execute(name: string, args: Record<string, any>, scope: CustomerScope): Promise<unknown> {
    try {
      if (name === 'get_my_orders') return await this.myOrders(args, scope);
      return { error: `ไม่รู้จักเครื่องมือ ${name}` };
    } catch (err: any) {
      this.logger.error(`Tool ${name} failed: ${err?.message}`);
      return { error: 'ดึงข้อมูลออเดอร์ไม่สำเร็จในขณะนี้' };
    }
  }

  private async myOrders(args: any, scope: CustomerScope) {
    let ownerWhere: any;
    let mode: 'account' | 'table';
    if (scope.userId) {
      ownerWhere = { user_id: scope.userId };
      mode = 'account';
    } else if (scope.tableNumber) {
      // หน้าสั่งผ่าน QR ส่งมาเป็น table_id (เช่น "3") ส่วนที่อื่นอาจส่ง table_number (เช่น "T-03")
      const raw = String(scope.tableNumber).trim();
      const digits = Number(raw.replace(/\D/g, ''));
      const table =
        (await this.prisma.table.findFirst({ where: { table_number: raw } })) ||
        (digits ? await this.prisma.table.findUnique({ where: { table_id: digits } }) : null);
      if (!table) return { error: `ไม่พบโต๊ะ ${scope.tableNumber} ในระบบ` };
      // ลูกค้าที่โต๊ะ เห็นได้เฉพาะออเดอร์ที่ยังเปิดอยู่ของโต๊ะนี้ (ไม่ย้อนดูประวัติ)
      ownerWhere = { table_id: table.table_id, status: { in: OPEN_STATUSES } };
      mode = 'table';
    } else {
      return { error: 'NOT_SIGNED_IN', message: 'ลูกค้ายังไม่ได้เข้าสู่ระบบ และไม่ได้สั่งผ่าน QR ที่โต๊ะ จึงตรวจสอบออเดอร์ไม่ได้' };
    }

    const where: any = { ...ownerWhere };
    if (args.order_id) where.order_id = Number(args.order_id);
    else if (!(args.include_past && mode === 'account')) where.status = { in: OPEN_STATUSES };

    const orders = await this.prisma.order.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: args.include_past ? 5 : 10,
      include: {
        table: { select: { table_number: true } },
        order_items: {
          include: { menu: { select: { menu_name: true } }, order_item_options: { select: { option_name: true } } },
        },
        transaction: { select: { payment_method: true, payment_status: true }, orderBy: { transaction_id: 'desc' }, take: 1 },
        delivery: {
          select: {
            delivery_status: true,
            distance_km: true,
            assigned_at: true,
            picked_up_at: true,
            delivered_at: true,
            rider: { select: { username: true } },
          },
        },
      },
    });

    if (!orders.length) {
      return {
        mode,
        orders: [],
        message: args.order_id
          ? `ไม่พบออเดอร์ #${args.order_id} ในบัญชี/โต๊ะของลูกค้าคนนี้`
          : 'ตอนนี้ไม่มีออเดอร์ที่กำลังดำเนินการอยู่',
      };
    }

    // คิวในครัว: จำนวนออเดอร์ที่ยังไม่เสร็จและเข้ามาก่อน
    const kitchenQueue = await this.prisma.order.findMany({
      where: { status: { in: ['PENDING', 'COOKING'] } },
      select: { order_id: true, created_at: true },
      orderBy: { created_at: 'asc' },
    });
    // เวลาปรุงเฉลี่ยจาก 50 ออเดอร์ล่าสุด เพื่อประมาณเวลารอ
    const recentCooked = await this.prisma.order.findMany({
      where: { cooking_started_at: { not: null }, cooked_at: { not: null } },
      select: { cooking_started_at: true, cooked_at: true },
      orderBy: { order_id: 'desc' },
      take: 50,
    });
    const cookTimes = recentCooked
      .map((o) => (o.cooked_at!.getTime() - o.cooking_started_at!.getTime()) / 60000)
      .filter((m) => m > 0 && m < 120);
    const avgCook = cookTimes.length ? Math.round(cookTimes.reduce((s, m) => s + m, 0) / cookTimes.length) : null;

    return {
      mode,
      now: fmt(new Date()),
      avg_cooking_minutes_recently: avgCook,
      orders: orders.map((o) => {
        const qIdx = kitchenQueue.findIndex((q) => q.order_id === o.order_id);
        const pay = o.transaction[0];
        return {
          order_id: o.order_id,
          order_type: o.order_type,
          table: o.table?.table_number || null,
          status: o.status,
          status_meaning: ORDER_STATUS_TH[o.status] || o.status,
          ordered_at: fmt(o.created_at),
          minutes_since_order: mins(o.created_at),
          kitchen_started_at: fmt(o.cooking_started_at),
          cooked_at: fmt(o.cooked_at),
          orders_ahead_in_kitchen: qIdx >= 0 ? qIdx : null,
          items: o.order_items.map((i) => ({
            menu: i.menu?.menu_name,
            qty: i.quantity,
            options: i.order_item_options.map((x) => x.option_name),
            notes: i.notes,
          })),
          total: num(o.total_price),
          payment: pay
            ? { method: pay.payment_method, status: pay.payment_status, meaning: PAYMENT_STATUS_TH[pay.payment_status] || pay.payment_status }
            : { status: 'NONE', meaning: 'ยังไม่มีรายการชำระเงิน' },
          delivery: o.delivery
            ? {
                status: o.delivery.delivery_status,
                meaning: DELIVERY_STATUS_TH[o.delivery.delivery_status] || o.delivery.delivery_status,
                rider: o.delivery.rider?.username || null,
                distance_km: num(o.delivery.distance_km),
                picked_up_at: fmt(o.delivery.picked_up_at),
                delivered_at: fmt(o.delivery.delivered_at),
              }
            : null,
        };
      }),
    };
  }
}
