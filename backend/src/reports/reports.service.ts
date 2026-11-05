// src/reports/reports.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ExpensesService } from '../expenses/expenses.service';
import { QueryFinanceReportDto } from './dto/query-finance-report.dto';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly expensesService: ExpensesService,
  ) {}

  // 1. สรุปยอดขายรวมจาก ORDER_SUMMARIES_VIEW
  async getOrderSummaries() {
    try {
      return await this.prisma.orderSummary.findMany({
        orderBy: { order_id: 'desc' },
      });
    } catch (err) {
      this.logger.warn(`Query via prisma.orderSummary failed, using raw query fallback: ${err.message}`);
      return await this.prisma.$queryRawUnsafe(`
        SELECT 
          o.order_id, 
          t.table_number, 
          o.total_price, 
          o.status, 
          o.created_at AS order_date
        FROM ORDERS o
        LEFT JOIN TABLES t ON o.table_id = t.table_id
        ORDER BY o.order_id DESC
      `).catch(() => []);
    }
  }

  // 2. รายการใบเสร็จ/ทำบิลจาก TRANSACTION_RECEIPTS_VIEW
  async getReceipts() {
    try {
      return await this.prisma.transactionReceipt.findMany({
        orderBy: { transaction_id: 'desc' },
      });
    } catch (err) {
      this.logger.warn(`Query via prisma.transactionReceipt failed, using raw query fallback: ${err.message}`);
      return await this.prisma.$queryRawUnsafe(`
        SELECT 
          tr.transaction_id,
          tr.order_id,
          COALESCE(u.username, 'ลูกค้าทั่วไป') AS customer_name,
          tr.amount AS total_amount,
          tr.payment_method,
          tr.payment_status,
          o.created_at AS payment_date
        FROM TRANSACTIONS tr
        LEFT JOIN ORDERS o ON tr.order_id = o.order_id
        LEFT JOIN USERS u ON o.user_id = u.user_id
        ORDER BY tr.transaction_id DESC
      `).catch(() => []);
    }
  }

  // 3. สรุปเมนูยอดฮิตขายดีจาก TOP_SELLING_MENUS_VIEW
  async getTopSellingMenus() {
    try {
      return await this.prisma.topSellingMenu.findMany({
        orderBy: { total_sold: 'desc' },
      });
    } catch (err) {
      this.logger.warn(`Query via prisma.topSellingMenu failed, using raw query fallback: ${err.message}`);
      return await this.prisma.$queryRawUnsafe(`
        SELECT 
          m.menu_id,
          m.menu_name AS menu_name,
          COALESCE(c.category_name, 'ทั่วไป') AS category_name,
          CAST(COALESCE(SUM(oi.quantity), 0) AS SIGNED) AS total_sold,
          CAST(COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS DECIMAL(10,2)) AS total_revenue
        FROM MENUS m
        LEFT JOIN CATEGORIES c ON m.category_id = c.category_id
        LEFT JOIN ORDER_ITEMS oi ON m.menu_id = oi.menu_id
        GROUP BY m.menu_id, m.menu_name, c.category_name
        ORDER BY total_sold DESC
      `).catch(() => []);
    }
  }

  // 4. สรุปภาพรวมสำหรับแดชบอร์ด
  async getDashboardAnalytics() {
    const [summaries, topSelling, receipts] = await Promise.all([
      this.getOrderSummaries(),
      this.getTopSellingMenus(),
      this.getReceipts(),
    ]);

    // กรองออเดอร์ที่ถูกยกเลิก (CANCELLED) ออกจากการคำนวณยอดขายรวม
    const activeSummaries = (summaries as any[]).filter(
      (s: any) => String(s.status || '').toUpperCase() !== 'CANCELLED',
    );

    const totalRevenue = activeSummaries.reduce(
      (sum: number, s: any) => sum + Number(s.total_price || 0),
      0,
    );
    const totalOrders = activeSummaries.length;

    return {
      totalRevenue,
      totalOrders,
      summaries,
      topSelling,
      receipts,
    };
  }

  // 5. สร้างข้อมูล CSV จาก Database Views สำหรับส่งออกรายงาน (UTF-8 BOM)
  async generateCsv() {
    const receipts = (await this.getReceipts()) as any[];
    const headers = [
      'ลำดับ',
      'รหัสใบเสร็จ',
      'รหัสออเดอร์',
      'ชื่อลูกค้า',
      'ยอดชำระสุทธิ (บาท)',
      'ช่องทางชำระเงิน',
      'สถานะการชำระ',
      'วันที่และเวลา',
    ];

    const rows = receipts.map((r, idx) => [
      idx + 1,
      `"#REC-${r.transaction_id}"`,
      `"#ORD-${r.order_id}"`,
      `"${r.customer_name || 'ลูกค้าทั่วไป'}"`,
      r.total_amount,
      `"${r.payment_method || '-'}"`,
      `"${r.payment_status || 'Completed'}"`,
      `"${r.payment_date ? new Date(r.payment_date).toLocaleString('th-TH') : '-'}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  // 6. สรุปรายงานไรเดอร์ (รอบส่ง, ค่ารอบ, ยอดเงินสดค้าง/รอยืนยัน/รับแล้ว)
  async getRiderReport(query?: { from?: string; to?: string }) {
    // ดึงไรเดอร์ทั้งหมดที่มีในระบบ (role = 'RIDER')
    const riders = await this.prisma.user.findMany({
      where: { role: 'RIDER' },
      select: {
        user_id: true,
        username: true,
        phone_number: true,
      },
      orderBy: { user_id: 'asc' },
    });

    const deliveryWhere: any = {
      rider_id: { not: null },
      delivery_status: 'DELIVERED',
    };

    if (query?.from || query?.to) {
      deliveryWhere.delivered_at = {};

      if (query.from) {
        const fromStr = query.from.slice(0, 10);
        deliveryWhere.delivered_at.gte = new Date(`${fromStr}T00:00:00+07:00`);
      }

      if (query.to) {
        const toStr = query.to.slice(0, 10);
        deliveryWhere.delivered_at.lte = new Date(`${toStr}T23:59:59.999+07:00`);
      }

      if (Object.keys(deliveryWhere.delivered_at).length === 0) {
        delete deliveryWhere.delivered_at;
      }
    }

    const deliveries = await this.prisma.delivery.findMany({
      where: deliveryWhere,
      include: {
        rider: {
          select: {
            user_id: true,
            username: true,
            phone_number: true,
          },
        },
      },
    });

    // แมปข้อมูลแยกตาม rider_id
    const riderMap = new Map<
      number,
      {
        rider_id: number;
        rider_name: string;
        phone: string;
        total_rounds: number;
        total_fee: number;
        cash_pending: number;
        cash_submitted: number;
        cash_confirmed: number;
      }
    >();

    // เริ่มต้นจากไรเดอร์ที่ลงทะเบียนทุกคน
    for (const r of riders) {
      riderMap.set(r.user_id, {
        rider_id: r.user_id,
        rider_name: r.username,
        phone: r.phone_number || '-',
        total_rounds: 0,
        total_fee: 0,
        cash_pending: 0,
        cash_submitted: 0,
        cash_confirmed: 0,
      });
    }

    // รวมสถิติจากงานจัดส่งที่ส่งสำเร็จ (DELIVERED)
    for (const d of deliveries) {
      if (!d.rider_id) continue;

      let stat = riderMap.get(d.rider_id);
      if (!stat) {
        stat = {
          rider_id: d.rider_id,
          rider_name: d.rider?.username || `ไรเดอร์ #${d.rider_id}`,
          phone: d.rider?.phone_number || '-',
          total_rounds: 0,
          total_fee: 0,
          cash_pending: 0,
          cash_submitted: 0,
          cash_confirmed: 0,
        };
        riderMap.set(d.rider_id, stat);
      }

      stat.total_rounds += 1;
      stat.total_fee += Number(d.rider_fee || 0);

      const cashStatusUpper = (d.cash_status || 'NONE').toUpperCase();
      const cashAmount = Number(d.cash_amount || 0);

      if (cashStatusUpper === 'PENDING') {
        stat.cash_pending += cashAmount;
      } else if (cashStatusUpper === 'SUBMITTED') {
        stat.cash_submitted += cashAmount;
      } else if (cashStatusUpper === 'CONFIRMED') {
        stat.cash_confirmed += cashAmount;
      }
    }

    // ปัดเศษทศนิยม 2 ตำแหน่ง
    return Array.from(riderMap.values()).map((r) => ({
      ...r,
      total_fee: Number(r.total_fee.toFixed(2)),
      cash_pending: Number(r.cash_pending.toFixed(2)),
      cash_submitted: Number(r.cash_submitted.toFixed(2)),
      cash_confirmed: Number(r.cash_confirmed.toFixed(2)),
    }));
  }

  // 7. รายงานสรุปการเงินและกำไรสุทธิ (Financial & Net Profit Report)
  async getFinanceReport(query: QueryFinanceReportDto) {
    const now = new Date();
    const toBangkokDateStr = (date: Date): string => {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date);
    };

    const todayBangkokStr = toBangkokDateStr(now);
    const toStr = query.to ? query.to.trim().slice(0, 10) : todayBangkokStr;

    let fromStr = query.from?.trim().slice(0, 10);
    if (!fromStr) {
      const refDate = new Date(`${toStr}T00:00:00+07:00`);
      refDate.setDate(refDate.getDate() - 29); // ค่าตั้งต้นย้อนหลัง 30 วันรวมถึงวันที่สิ้นสุด
      fromStr = toBangkokDateStr(refDate);
    }

    let startStr = fromStr;
    let endStr = toStr;
    if (startStr > endStr) {
      [startStr, endStr] = [endStr, startStr];
    }

    const startDate = new Date(`${startStr}T00:00:00.000+07:00`);
    const endDate = new Date(`${endStr}T23:59:59.999+07:00`);
    const group = query.group || 'day';

    // ดึงข้อมูล 4 ส่วนแบบ Asynchronous ขนานกัน (Promise.all)
    const [transactions, ingredientPurchases, deliveries, fuelResult] = await Promise.all([
      // 1. รายรับและค่าธรรมเนียม Stripe จาก TRANSACTIONS ที่ COMPLETED
      this.prisma.transaction.findMany({
        where: {
          payment_status: 'COMPLETED',
          OR: [
            { paid_at: { gte: startDate, lte: endDate } },
            { paid_at: null, created_at: { gte: startDate, lte: endDate } },
          ],
        },
        orderBy: { created_at: 'asc' },
      }),

      // 2. รายจ่ายวัตถุดิบจาก INGREDIENT_PURCHASES
      this.prisma.ingredientPurchase.findMany({
        where: {
          purchased_at: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { purchased_at: 'asc' },
      }),

      // 3. รายจ่ายค่ารอบไรเดอร์จาก DELIVERIES ที่ DELIVERED
      this.prisma.delivery.findMany({
        where: {
          delivery_status: 'DELIVERED',
          OR: [
            { delivered_at: { gte: startDate, lte: endDate } },
            { delivered_at: null, order: { created_at: { gte: startDate, lte: endDate } } },
          ],
        },
        include: {
          order: { select: { created_at: true } },
        },
        orderBy: { delivery_id: 'asc' },
      }),

      // 4. รายจ่ายค่าน้ำมันรถส่งของจาก ExpensesService
      this.expensesService.calculateFuelExpense(startDate, endDate),
    ]);

    // คำนวณรายรับรวมและแจกแจงตามช่องทาง
    let total_revenue = 0;
    let revenue_card = 0;
    let revenue_promptpay = 0;
    let revenue_cash = 0;
    let total_stripe_fee = 0;

    for (const txn of transactions) {
      const amt = Number(txn.amount || 0);
      const sFee = Number(txn.stripe_fee || 0);
      total_revenue += amt;
      total_stripe_fee += sFee;

      const method = String(txn.payment_method || '').trim().toUpperCase();
      if (['CARD', 'STRIPE', 'DEBIT_CARD', 'CREDIT_CARD'].includes(method)) {
        revenue_card += amt;
      } else if (method === 'PROMPTPAY') {
        revenue_promptpay += amt;
      } else if (method === 'CASH') {
        revenue_cash += amt;
      } else {
        revenue_card += amt;
      }
    }

    // คำนวณรายจ่ายแต่ละประเภท
    const total_ingredients = ingredientPurchases.reduce(
      (sum, p) => sum + Number(p.total_price || 0),
      0,
    );

    const total_fuel = Number(fuelResult?.total_fuel_expense || 0);

    const total_rider_fee = deliveries.reduce(
      (sum, d) => sum + Number(d.rider_fee || 0),
      0,
    );

    // ผลรวมรายจ่ายทั้งหมด 4 ส่วน
    const total_expenses = total_ingredients + total_fuel + total_rider_fee + total_stripe_fee;

    // คำนวณกำไรสุทธิ (Net Profit = Total Revenue - Total Expenses)
    const net_profit = total_revenue - total_expenses;
    const profit_margin_percentage = total_revenue > 0
      ? Number(((net_profit / total_revenue) * 100).toFixed(2))
      : 0;

    // เตรียมโครงสร้างข้อมูล Time-series Breakdown ต่อเนื่องทุกวัน
    const dayMap = new Map<
      string,
      {
        revenue_card: number;
        revenue_promptpay: number;
        revenue_cash: number;
        ingredients: number;
        fuel: number;
        rider_fee: number;
        stripe_fee: number;
      }
    >();

    const currDate = new Date(`${startStr}T00:00:00+07:00`);
    const lastDate = new Date(`${endStr}T00:00:00+07:00`);

    while (currDate <= lastDate) {
      const dStr = toBangkokDateStr(currDate);
      dayMap.set(dStr, {
        revenue_card: 0,
        revenue_promptpay: 0,
        revenue_cash: 0,
        ingredients: 0,
        fuel: 0,
        rider_fee: 0,
        stripe_fee: 0,
      });
      currDate.setDate(currDate.getDate() + 1);
    }

    const getOrCreateDay = (dStr: string) => {
      let stat = dayMap.get(dStr);
      if (!stat) {
        stat = {
          revenue_card: 0,
          revenue_promptpay: 0,
          revenue_cash: 0,
          ingredients: 0,
          fuel: 0,
          rider_fee: 0,
          stripe_fee: 0,
        };
        dayMap.set(dStr, stat);
      }
      return stat;
    };

    // รวมยอด Transaction ลงแต่ละวัน
    for (const txn of transactions) {
      const txnDate = txn.paid_at || txn.created_at;
      const dStr = toBangkokDateStr(txnDate);
      const stat = getOrCreateDay(dStr);
      const amt = Number(txn.amount || 0);
      const sFee = Number(txn.stripe_fee || 0);

      const method = String(txn.payment_method || '').trim().toUpperCase();
      if (['CARD', 'STRIPE', 'DEBIT_CARD', 'CREDIT_CARD'].includes(method)) {
        stat.revenue_card += amt;
      } else if (method === 'PROMPTPAY') {
        stat.revenue_promptpay += amt;
      } else if (method === 'CASH') {
        stat.revenue_cash += amt;
      } else {
        stat.revenue_card += amt;
      }
      stat.stripe_fee += sFee;
    }

    // รวมยอดซื้อวัตถุดิบลงแต่ละวัน
    for (const p of ingredientPurchases) {
      const dStr = toBangkokDateStr(p.purchased_at);
      const stat = getOrCreateDay(dStr);
      stat.ingredients += Number(p.total_price || 0);
    }

    // รวมค่ารอบไรเดอร์ลงแต่ละวัน
    for (const d of deliveries) {
      const dDate = d.delivered_at || d.order?.created_at || new Date();
      const dStr = toBangkokDateStr(dDate);
      const stat = getOrCreateDay(dStr);
      stat.rider_fee += Number(d.rider_fee || 0);
    }

    // รวมค่าน้ำมันลงแต่ละวัน (ทั้งที่บันทึกแล้วและวันที่ร้านเปิดอัตโนมัติ)
    if (fuelResult?.logs) {
      for (const log of fuelResult.logs) {
        const logDateStr = log.log_date instanceof Date
          ? log.log_date.toISOString().slice(0, 10)
          : String(log.log_date).slice(0, 10);
        const stat = getOrCreateDay(logDateStr);
        stat.fuel += Number(log.amount || 0);
      }
    }
    if (fuelResult?.unrecorded_dates) {
      const dailyAmt = Number(fuelResult.daily_amount || 300);
      for (const dateStr of fuelResult.unrecorded_dates) {
        const stat = getOrCreateDay(dateStr);
        stat.fuel += dailyAmt;
      }
    }

    // ฟังก์ชันคำนวณสัปดาห์ ISO 8601 (YYYY-Www)
    const getIsoWeekString = (dateStr: string): string => {
      const date = new Date(`${dateStr}T00:00:00+07:00`);
      const target = new Date(date.valueOf());
      const dayNr = (date.getDay() + 6) % 7;
      target.setDate(target.getDate() - dayNr + 3);
      const firstThursday = target.valueOf();
      target.setMonth(0, 1);
      if (target.getDay() !== 4) {
        target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
      }
      const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
      return `${target.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
    };

    // จัดกลุ่มตาม group: 'day' | 'week' | 'month'
    const periodMap = new Map<
      string,
      {
        period: string;
        revenue_card: number;
        revenue_promptpay: number;
        revenue_cash: number;
        ingredients: number;
        fuel: number;
        rider_fee: number;
        stripe_fee: number;
      }
    >();

    for (const [dStr, dayStat] of dayMap.entries()) {
      let periodKey = dStr;
      if (group === 'month') {
        periodKey = dStr.slice(0, 7);
      } else if (group === 'week') {
        periodKey = getIsoWeekString(dStr);
      }

      let pData = periodMap.get(periodKey);
      if (!pData) {
        pData = {
          period: periodKey,
          revenue_card: 0,
          revenue_promptpay: 0,
          revenue_cash: 0,
          ingredients: 0,
          fuel: 0,
          rider_fee: 0,
          stripe_fee: 0,
        };
        periodMap.set(periodKey, pData);
      }

      pData.revenue_card += dayStat.revenue_card;
      pData.revenue_promptpay += dayStat.revenue_promptpay;
      pData.revenue_cash += dayStat.revenue_cash;
      pData.ingredients += dayStat.ingredients;
      pData.fuel += dayStat.fuel;
      pData.rider_fee += dayStat.rider_fee;
      pData.stripe_fee += dayStat.stripe_fee;
    }

    const breakdown = Array.from(periodMap.values()).map((p) => {
      const rev = Number((p.revenue_card + p.revenue_promptpay + p.revenue_cash).toFixed(2));
      const exp = Number((p.ingredients + p.fuel + p.rider_fee + p.stripe_fee).toFixed(2));
      const np = Number((rev - exp).toFixed(2));

      return {
        period: p.period,
        revenue: rev,
        revenue_card: Number(p.revenue_card.toFixed(2)),
        revenue_promptpay: Number(p.revenue_promptpay.toFixed(2)),
        revenue_cash: Number(p.revenue_cash.toFixed(2)),
        revenue_breakdown: {
          card: Number(p.revenue_card.toFixed(2)),
          promptpay: Number(p.revenue_promptpay.toFixed(2)),
          cash: Number(p.revenue_cash.toFixed(2)),
        },
        expenses: exp,
        expenses_breakdown: {
          ingredients: Number(p.ingredients.toFixed(2)),
          fuel: Number(p.fuel.toFixed(2)),
          rider_fee: Number(p.rider_fee.toFixed(2)),
          stripe_fee: Number(p.stripe_fee.toFixed(2)),
        },
        net_profit: np,
      };
    });

    return {
      start_date: startStr,
      end_date: endStr,
      group,
      total_revenue: Number(total_revenue.toFixed(2)),
      revenue_card: Number(revenue_card.toFixed(2)),
      revenue_promptpay: Number(revenue_promptpay.toFixed(2)),
      revenue_cash: Number(revenue_cash.toFixed(2)),
      total_expenses: Number(total_expenses.toFixed(2)),
      total_ingredients: Number(total_ingredients.toFixed(2)),
      total_fuel: Number(total_fuel.toFixed(2)),
      total_rider_fee: Number(total_rider_fee.toFixed(2)),
      total_stripe_fee: Number(total_stripe_fee.toFixed(2)),
      net_profit: Number(net_profit.toFixed(2)),
      profit_margin_percentage,
      breakdown,
    };
  }
}

