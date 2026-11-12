// src/chatbot/admin-ai-tools.ts
// เครื่องมือ (Function Calling) ให้ Gemini เรียกดึงข้อมูลจริงจากฐานข้อมูลเองตามคำถามของผู้จัดการ
// ทุกฟังก์ชันเป็นแบบอ่านอย่างเดียว (read-only) ไม่มีการแก้ไขข้อมูลใดๆ
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ReportsService } from '../reports/reports.service';

const TZ = 'Asia/Bangkok';

/** วันที่ YYYY-MM-DD ตามเวลาไทย */
export const bkkDate = (d: Date): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

const bkkHour = (d: Date): number =>
  Number(new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', hour12: false }).format(d)) % 24;

const bkkWeekday = (d: Date): string =>
  new Intl.DateTimeFormat('th-TH', { timeZone: TZ, weekday: 'long' }).format(d);

const bkkDateTime = (d: Date | null | undefined): string | null =>
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

const num = (v: unknown): number => Number(v ?? 0) || 0;
const round = (n: number, d = 2): number => Math.round(n * 10 ** d) / 10 ** d;
const minutesBetween = (a?: Date | null, b?: Date | null): number | null =>
  a && b ? round((b.getTime() - a.getTime()) / 60000, 1) : null;
const avg = (arr: number[]): number | null => (arr.length ? round(arr.reduce((s, x) => s + x, 0) / arr.length, 1) : null);

/** แปลงช่วงวันที่ (YYYY-MM-DD ตามเวลาไทย) เป็น Date; ค่าเริ่มต้น = 30 วันล่าสุด */
function resolveRange(from?: string, to?: string, defaultDays = 30) {
  const today = bkkDate(new Date());
  let end = /^\d{4}-\d{2}-\d{2}/.test(to || '') ? to!.slice(0, 10) : today;
  let start: string;
  if (/^\d{4}-\d{2}-\d{2}/.test(from || '')) {
    start = from!.slice(0, 10);
  } else {
    const ref = new Date(`${end}T00:00:00+07:00`);
    ref.setDate(ref.getDate() - (defaultDays - 1));
    start = bkkDate(ref);
  }
  if (start > end) [start, end] = [end, start];
  return {
    from: start,
    to: end,
    gte: new Date(`${start}T00:00:00.000+07:00`),
    lte: new Date(`${end}T23:59:59.999+07:00`),
  };
}

const RANGE_PROPS = {
  from: { type: 'string', description: 'วันที่เริ่มต้นแบบ YYYY-MM-DD (เวลาไทย) ถ้าไม่ระบุ = 30 วันล่าสุด' },
  to: { type: 'string', description: 'วันที่สิ้นสุดแบบ YYYY-MM-DD (เวลาไทย) ถ้าไม่ระบุ = วันนี้' },
};

/** รายการเครื่องมือที่ประกาศให้ Gemini รู้จัก (JSON Schema) */
export const ADMIN_TOOL_DECLARATIONS = [
  {
    name: 'get_finance_report',
    description:
      'รายรับ (บัตร/พร้อมเพย์/เงินสด เฉพาะชำระสำเร็จ), รายจ่าย (ค่าวัตถุดิบ, ค่าไรเดอร์, ค่าน้ำมันรถร้าน, ค่าธรรมเนียม Stripe), กำไรสุทธิ และอัตรากำไร พร้อมแจกแจงรายวัน/สัปดาห์/เดือน ตัวเลขเดียวกับหน้า "สรุปการเงิน"',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        ...RANGE_PROPS,
        group: { type: 'string', enum: ['day', 'week', 'month'], description: 'การจัดกลุ่มช่วงเวลา' },
      },
    },
  },
  {
    name: 'get_sales_summary',
    description:
      'สรุปยอดสั่งซื้อ (ออเดอร์) ในช่วงเวลา: จำนวนออเดอร์แยกสถานะ/ประเภท (DINE_IN, TAKEAWAY, DELIVERY), ยอดรวม, ส่วนลด, ค่าส่ง, ยอดเฉลี่ยต่อบิล, ยอดขายแยกตามชั่วโมงและวันในสัปดาห์ (หาช่วงพีค), ยอดรายวัน',
    parametersJsonSchema: { type: 'object', properties: { ...RANGE_PROPS } },
  },
  {
    name: 'get_menu_performance',
    description:
      'อันดับเมนูขายดี/ขายไม่ดี: จำนวนจานที่ขาย, ยอดขาย, ต้นทุนวัตถุดิบต่อจาน (จากสูตร x ราคาซื้อเฉลี่ย), กำไรขั้นต้นต่อจาน, เมนูที่ไม่มีคนสั่งเลย และสรุปตามหมวดหมู่',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        ...RANGE_PROPS,
        limit: { type: 'integer', description: 'จำนวนอันดับที่ต้องการ (ค่าเริ่มต้น 10)' },
      },
    },
  },
  {
    name: 'get_menu_catalog',
    description:
      'รายการเมนูทั้งหมด: หมวดหมู่, ราคา, เปิด/ปิดขาย, แคลอรี่, สารก่อภูมิแพ้, ตัวเลือกเสริม, สูตรวัตถุดิบต่อจาน และต้นทุนต่อจาน',
    parametersJsonSchema: {
      type: 'object',
      properties: { search: { type: 'string', description: 'ค้นหาจากชื่อเมนู (ไม่บังคับ)' } },
    },
  },
  {
    name: 'get_ingredient_stock',
    description:
      'คลังวัตถุดิบ: จำนวนคงเหลือ, เกณฑ์ขั้นต่ำ, สถานะใกล้หมด, ราคาซื้อเฉลี่ยต่อหน่วย, อัตราการใช้ต่อวันโดยประมาณจากยอดขาย 14 วัน และจำนวนวันที่จะใช้ได้อีก',
    parametersJsonSchema: {
      type: 'object',
      properties: { only_low_stock: { type: 'boolean', description: 'true = เฉพาะรายการที่ต่ำกว่าเกณฑ์' } },
    },
  },
  {
    name: 'get_ingredient_purchases',
    description: 'ประวัติการซื้อวัตถุดิบเข้าคลัง (วันที่, ชื่อ, จำนวน, ราคา, ราคาต่อหน่วย) และยอดรวมแยกตามวัตถุดิบ',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        ...RANGE_PROPS,
        ingredient_name: { type: 'string', description: 'กรองตามชื่อวัตถุดิบ (ไม่บังคับ)' },
      },
    },
  },
  {
    name: 'get_delivery_report',
    description:
      'งานเดลิเวอรี่และไรเดอร์: จำนวนงานแยกสถานะ, ค่าไรเดอร์รวม, ระยะทางเฉลี่ย, เวลาส่งเฉลี่ย, สถิติรายไรเดอร์, เงินสดเก็บปลายทางที่ยังค้างกับไรเดอร์/รอยืนยัน',
    parametersJsonSchema: { type: 'object', properties: { ...RANGE_PROPS } },
  },
  {
    name: 'get_reviews',
    description: 'รีวิวลูกค้า: คะแนนเฉลี่ย, การกระจายคะแนน 1-5 ดาว และข้อความรีวิว (ใช้สรุปคำชม/คำติ)',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        ...RANGE_PROPS,
        max_rating: { type: 'integer', description: 'ดึงเฉพาะรีวิวที่คะแนน <= ค่านี้ (เช่น 3 เพื่อดูคำติ)' },
        limit: { type: 'integer', description: 'จำนวนรีวิวสูงสุดที่แสดง (ค่าเริ่มต้น 30)' },
      },
    },
  },
  {
    name: 'get_kitchen_performance',
    description:
      'ประสิทธิภาพครัว: เวลารอเฉลี่ยก่อนเริ่มทำ, เวลาปรุงเฉลี่ย, ออเดอร์ที่ช้าที่สุด, คิวในครัวปัจจุบัน (PENDING/COOKING/READY)',
    parametersJsonSchema: { type: 'object', properties: { ...RANGE_PROPS } },
  },
  {
    name: 'get_orders',
    description: 'ค้นหารายละเอียดออเดอร์ (รายการอาหาร, ตัวเลือก, ราคา, การชำระเงิน, โต๊ะ, การจัดส่ง, รีวิว) ตามรหัสหรือเงื่อนไข',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        ...RANGE_PROPS,
        order_id: { type: 'integer', description: 'รหัสออเดอร์ (ถ้าระบุจะไม่ใช้เงื่อนไขอื่น)' },
        status: { type: 'string', description: 'สถานะ เช่น PENDING, COOKING, READY, SERVED, COMPLETED, CANCELLED' },
        order_type: { type: 'string', description: 'DINE_IN, TAKEAWAY หรือ DELIVERY' },
        limit: { type: 'integer', description: 'จำนวนสูงสุด (ค่าเริ่มต้น 20)' },
      },
    },
  },
  {
    name: 'get_tables',
    description: 'ผังโต๊ะอาหารปัจจุบัน: สถานะแต่ละโต๊ะ, ความจุ, ออเดอร์ที่ยังเปิดอยู่และยอดค้างชำระ',
    parametersJsonSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_promotions',
    description: 'โปรโมชั่น/โค้ดส่วนลด: เงื่อนไข, วันหมดอายุ, จำนวนครั้งที่ใช้, ยอดส่วนลดรวม และยอดขายที่เกิดจากโค้ดในช่วงเวลา',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        ...RANGE_PROPS,
        include_expired: { type: 'boolean', description: 'รวมโค้ดที่หมดอายุแล้วด้วย' },
      },
    },
  },
  {
    name: 'get_customer_insights',
    description: 'ข้อมูลลูกค้า: จำนวนลูกค้าที่สั่ง, ลูกค้าใหม่ vs ลูกค้าประจำ, ลูกค้าที่ใช้จ่ายสูงสุด, ความถี่ในการสั่ง',
    parametersJsonSchema: {
      type: 'object',
      properties: { ...RANGE_PROPS, limit: { type: 'integer', description: 'จำนวนลูกค้าอันดับต้นๆ (ค่าเริ่มต้น 10)' } },
    },
  },
  {
    name: 'get_store_settings',
    description: 'การตั้งค่าร้าน: เวลาเปิดปิด, สถานะร้าน, ค่าส่ง/ระยะส่ง, สูตรค่าไรเดอร์, ค่าน้ำมันต่อวัน, VAT, ข้อมูลติดต่อ',
    parametersJsonSchema: { type: 'object', properties: {} },
  },
];

export class AdminAiTools {
  private readonly logger = new Logger('AdminAiTools');

  constructor(
    private readonly prisma: PrismaService,
    private readonly reportsService: ReportsService,
  ) {}

  async execute(name: string, args: Record<string, any> = {}): Promise<unknown> {
    try {
      switch (name) {
        case 'get_finance_report':
          return await this.financeReport(args);
        case 'get_sales_summary':
          return await this.salesSummary(args);
        case 'get_menu_performance':
          return await this.menuPerformance(args);
        case 'get_menu_catalog':
          return await this.menuCatalog(args);
        case 'get_ingredient_stock':
          return await this.ingredientStock(args);
        case 'get_ingredient_purchases':
          return await this.ingredientPurchases(args);
        case 'get_delivery_report':
          return await this.deliveryReport(args);
        case 'get_reviews':
          return await this.reviews(args);
        case 'get_kitchen_performance':
          return await this.kitchenPerformance(args);
        case 'get_orders':
          return await this.orders(args);
        case 'get_tables':
          return await this.tables();
        case 'get_promotions':
          return await this.promotions(args);
        case 'get_customer_insights':
          return await this.customerInsights(args);
        case 'get_store_settings':
          return await this.storeSettings();
        default:
          return { error: `ไม่รู้จักเครื่องมือ ${name}` };
      }
    } catch (err: any) {
      this.logger.error(`Tool ${name} failed: ${err?.message}`);
      return { error: `ดึงข้อมูลไม่สำเร็จ: ${err?.message || 'unknown error'}` };
    }
  }

  // ---------- ตัวช่วยคำนวณต้นทุน ----------

  /** ราคาซื้อเฉลี่ยต่อหน่วยของวัตถุดิบ (ถ่วงน้ำหนักจากประวัติการซื้อทั้งหมด) */
  private async avgUnitCosts(): Promise<Map<number, number>> {
    const rows = await this.prisma.ingredientPurchase.groupBy({
      by: ['ingredient_id'],
      _sum: { quantity: true, total_price: true },
    });
    const map = new Map<number, number>();
    for (const r of rows) {
      const q = num(r._sum.quantity);
      if (r.ingredient_id != null && q > 0) map.set(r.ingredient_id, num(r._sum.total_price) / q);
    }
    return map;
  }

  private async recipeCosts(): Promise<Map<number, { cost: number; complete: boolean }>> {
    const [recipes, unitCosts] = await Promise.all([
      this.prisma.menuIngredient.findMany({ select: { menu_id: true, ingredient_id: true, quantity_used: true } }),
      this.avgUnitCosts(),
    ]);
    const map = new Map<number, { cost: number; complete: boolean }>();
    for (const r of recipes) {
      const entry = map.get(r.menu_id) || { cost: 0, complete: true };
      const unit = unitCosts.get(r.ingredient_id);
      if (unit == null) entry.complete = false;
      else entry.cost += unit * num(r.quantity_used);
      map.set(r.menu_id, entry);
    }
    return map;
  }

  // ---------- เครื่องมือแต่ละตัว ----------

  private async financeReport(args: any) {
    const r = resolveRange(args.from, args.to);
    const rep: any = await this.reportsService.getFinanceReport({ from: r.from, to: r.to, group: args.group || 'day' });
    const { breakdown, ...summary } = rep;
    const nonEmpty = (breakdown || []).filter((b: any) => b.revenue || b.expenses);
    return { ...summary, breakdown: nonEmpty.slice(-62) };
  }

  private async salesSummary(args: any) {
    const r = resolveRange(args.from, args.to);
    const orders = await this.prisma.order.findMany({
      where: { created_at: { gte: r.gte, lte: r.lte } },
      select: {
        order_id: true,
        status: true,
        order_type: true,
        subtotal: true,
        discount_amount: true,
        delivery_fee: true,
        total_price: true,
        created_at: true,
        user_id: true,
      },
    });
    const valid = orders.filter((o) => o.status !== 'CANCELLED');
    const sum = (arr: typeof orders, f: (o: (typeof orders)[number]) => number) => round(arr.reduce((s, o) => s + f(o), 0));

    const byStatus: Record<string, number> = {};
    orders.forEach((o) => (byStatus[o.status] = (byStatus[o.status] || 0) + 1));

    const byType: Record<string, { orders: number; total: number }> = {};
    const byHour: Record<string, { orders: number; total: number }> = {};
    const byWeekday: Record<string, { orders: number; total: number }> = {};
    const byDay: Record<string, { orders: number; total: number }> = {};
    const add = (m: Record<string, { orders: number; total: number }>, k: string, v: number) => {
      m[k] = m[k] || { orders: 0, total: 0 };
      m[k].orders += 1;
      m[k].total = round(m[k].total + v);
    };
    for (const o of valid) {
      const t = num(o.total_price);
      add(byType, o.order_type, t);
      add(byHour, `${String(bkkHour(o.created_at)).padStart(2, '0')}:00`, t);
      add(byWeekday, bkkWeekday(o.created_at), t);
      add(byDay, bkkDate(o.created_at), t);
    }
    const total = sum(valid, (o) => num(o.total_price));
    return {
      range: { from: r.from, to: r.to },
      note: 'ยอดนี้นับจากออเดอร์ที่ไม่ถูกยกเลิก (รวมออเดอร์ที่ยังไม่ชำระ) ถ้าต้องการเงินเข้าจริงให้ใช้ get_finance_report',
      total_orders: orders.length,
      valid_orders: valid.length,
      cancelled_orders: byStatus['CANCELLED'] || 0,
      orders_by_status: byStatus,
      gross_subtotal: sum(valid, (o) => num(o.subtotal)),
      total_discount: sum(valid, (o) => num(o.discount_amount)),
      total_delivery_fee_charged: sum(valid, (o) => num(o.delivery_fee)),
      total_sales: total,
      average_ticket: valid.length ? round(total / valid.length) : 0,
      by_order_type: byType,
      by_hour: Object.fromEntries(Object.entries(byHour).sort()),
      by_weekday: byWeekday,
      by_day: Object.fromEntries(Object.entries(byDay).sort()),
    };
  }

  private async menuPerformance(args: any) {
    const r = resolveRange(args.from, args.to);
    const limit = Math.min(Math.max(Number(args.limit) || 10, 1), 50);
    const [items, menus, costs] = await Promise.all([
      this.prisma.orderItem.findMany({
        where: { order: { created_at: { gte: r.gte, lte: r.lte }, status: { not: 'CANCELLED' } } },
        select: { menu_id: true, quantity: true, unit_price: true },
      }),
      this.prisma.menu.findMany({
        select: { menu_id: true, menu_name: true, price: true, is_available: true, category: { select: { category_name: true } } },
      }),
      this.recipeCosts(),
    ]);

    const stats = new Map<number, { qty: number; revenue: number }>();
    for (const it of items) {
      const s = stats.get(it.menu_id) || { qty: 0, revenue: 0 };
      s.qty += it.quantity;
      s.revenue += num(it.unit_price) * it.quantity;
      stats.set(it.menu_id, s);
    }

    const rows = menus.map((m) => {
      const s = stats.get(m.menu_id) || { qty: 0, revenue: 0 };
      const c = costs.get(m.menu_id);
      const unitCost = c ? round(c.cost) : null;
      return {
        menu_name: m.menu_name,
        category: m.category?.category_name,
        price: num(m.price),
        is_available: m.is_available,
        qty_sold: s.qty,
        revenue: round(s.revenue),
        ingredient_cost_per_dish: unitCost,
        cost_data_complete: c ? c.complete : false,
        gross_profit_per_dish: unitCost != null ? round(num(m.price) - unitCost) : null,
        gross_margin_pct: unitCost != null && num(m.price) > 0 ? round(((num(m.price) - unitCost) / num(m.price)) * 100, 1) : null,
        total_gross_profit: unitCost != null ? round(s.revenue - unitCost * s.qty) : null,
      };
    });

    const sold = rows.filter((x) => x.qty_sold > 0).sort((a, b) => b.qty_sold - a.qty_sold);
    const byCategory: Record<string, { qty: number; revenue: number }> = {};
    rows.forEach((x) => {
      const k = x.category || 'ไม่ระบุ';
      byCategory[k] = byCategory[k] || { qty: 0, revenue: 0 };
      byCategory[k].qty += x.qty_sold;
      byCategory[k].revenue = round(byCategory[k].revenue + x.revenue);
    });

    return {
      range: { from: r.from, to: r.to },
      note: 'ต้นทุนต่อจาน = ปริมาณในสูตร x ราคาซื้อเฉลี่ยต่อหน่วย; cost_data_complete=false แปลว่าบางวัตถุดิบยังไม่มีประวัติการซื้อ ต้นทุนจึงต่ำกว่าจริง',
      total_dishes_sold: sold.reduce((s, x) => s + x.qty_sold, 0),
      best_sellers: sold.slice(0, limit),
      worst_sellers: [...sold].reverse().slice(0, limit),
      top_revenue: [...sold].sort((a, b) => b.revenue - a.revenue).slice(0, limit),
      never_sold_in_range: rows.filter((x) => x.qty_sold === 0).map((x) => x.menu_name),
      by_category: byCategory,
    };
  }

  private async menuCatalog(args: any) {
    const [menus, costs, unitCosts] = await Promise.all([
      this.prisma.menu.findMany({
        where: args.search ? { menu_name: { contains: String(args.search) } } : undefined,
        select: {
          menu_id: true,
          menu_name: true,
          description: true,
          price: true,
          calories: true,
          is_available: true,
          category: { select: { category_name: true } },
          allergens: { select: { allergen: { select: { allergen_name: true } } } },
          option_groups: {
            select: {
              group_name: true,
              is_required: true,
              options: { select: { option_name: true, additional_price: true, is_available: true } },
            },
          },
          ingredients: { select: { quantity_used: true, ingredient: { select: { ingredient_id: true, name: true, unit: true } } } },
        },
        orderBy: { menu_id: 'asc' },
      }),
      this.recipeCosts(),
      this.avgUnitCosts(),
    ]);
    return menus.map((m) => ({
      menu_id: m.menu_id,
      menu_name: m.menu_name,
      category: m.category?.category_name,
      price: num(m.price),
      calories: m.calories,
      is_available: m.is_available,
      description: m.description,
      allergens: m.allergens.map((a) => a.allergen?.allergen_name).filter(Boolean),
      options: m.option_groups.map((g) => ({
        group: g.group_name,
        required: g.is_required,
        choices: g.options.map((o) => `${o.option_name}${num(o.additional_price) ? ` (+${num(o.additional_price)})` : ''}${o.is_available ? '' : ' [หมด]'}`),
      })),
      recipe: m.ingredients.map((i) => {
        const unit = i.ingredient ? unitCosts.get(i.ingredient.ingredient_id) : undefined;
        return {
          ingredient: i.ingredient?.name,
          quantity: num(i.quantity_used),
          unit: i.ingredient?.unit,
          cost: unit != null ? round(unit * num(i.quantity_used)) : null,
        };
      }),
      ingredient_cost_per_dish: costs.has(m.menu_id) ? round(costs.get(m.menu_id)!.cost) : null,
    }));
  }

  private async ingredientStock(args: any) {
    const since = new Date(Date.now() - 14 * 24 * 3600 * 1000);
    const [ingredients, unitCosts, recipes, items] = await Promise.all([
      this.prisma.ingredient.findMany({ orderBy: { name: 'asc' } }),
      this.avgUnitCosts(),
      this.prisma.menuIngredient.findMany({ select: { menu_id: true, ingredient_id: true, quantity_used: true } }),
      this.prisma.orderItem.findMany({
        where: { order: { created_at: { gte: since }, status: { not: 'CANCELLED' } } },
        select: { menu_id: true, quantity: true },
      }),
    ]);

    // ปริมาณที่ใช้ไปใน 14 วันจากสูตร x จำนวนจานที่ขาย
    const soldByMenu = new Map<number, number>();
    items.forEach((i) => soldByMenu.set(i.menu_id, (soldByMenu.get(i.menu_id) || 0) + i.quantity));
    const used = new Map<number, number>();
    recipes.forEach((r) =>
      used.set(r.ingredient_id, (used.get(r.ingredient_id) || 0) + num(r.quantity_used) * (soldByMenu.get(r.menu_id) || 0)),
    );

    const rows = ingredients.map((i) => {
      const perDay = (used.get(i.ingredient_id) || 0) / 14;
      const unit = unitCosts.get(i.ingredient_id);
      return {
        name: i.name,
        in_stock: num(i.quantity),
        unit: i.unit,
        reorder_level: num(i.min_quantity),
        is_low_stock: num(i.quantity) <= num(i.min_quantity),
        avg_purchase_price_per_unit: unit != null ? round(unit) : null,
        stock_value: unit != null ? round(unit * num(i.quantity)) : null,
        est_usage_per_day: round(perDay),
        est_days_left: perDay > 0 ? round(num(i.quantity) / perDay, 1) : null,
        last_updated: bkkDateTime(i.updated_at),
      };
    });
    const filtered = args.only_low_stock ? rows.filter((x) => x.is_low_stock) : rows;
    return {
      total_items: rows.length,
      low_stock_count: rows.filter((x) => x.is_low_stock).length,
      total_stock_value: round(rows.reduce((s, x) => s + (x.stock_value || 0), 0)),
      note: 'est_usage_per_day คำนวณจากยอดขาย 14 วันล่าสุด x สูตรอาหาร (null = ไม่มีข้อมูลการใช้)',
      items: filtered,
    };
  }

  private async ingredientPurchases(args: any) {
    const r = resolveRange(args.from, args.to);
    const purchases = await this.prisma.ingredientPurchase.findMany({
      where: {
        purchased_at: { gte: r.gte, lte: r.lte },
        ...(args.ingredient_name ? { ingredient_name: { contains: String(args.ingredient_name) } } : {}),
      },
      orderBy: { purchased_at: 'desc' },
      include: { purchaser: { select: { username: true } } },
    });
    const byIngredient: Record<string, { quantity: number; unit: string; total: number; times: number }> = {};
    purchases.forEach((p) => {
      const k = p.ingredient_name;
      byIngredient[k] = byIngredient[k] || { quantity: 0, unit: p.unit, total: 0, times: 0 };
      byIngredient[k].quantity = round(byIngredient[k].quantity + num(p.quantity));
      byIngredient[k].total = round(byIngredient[k].total + num(p.total_price));
      byIngredient[k].times += 1;
    });
    return {
      range: { from: r.from, to: r.to },
      total_spent: round(purchases.reduce((s, p) => s + num(p.total_price), 0)),
      purchase_count: purchases.length,
      by_ingredient: byIngredient,
      purchases: purchases.slice(0, 50).map((p) => ({
        date: bkkDateTime(p.purchased_at),
        ingredient: p.ingredient_name,
        quantity: num(p.quantity),
        unit: p.unit,
        total_price: num(p.total_price),
        price_per_unit: num(p.quantity) ? round(num(p.total_price) / num(p.quantity)) : null,
        purchased_by: p.purchaser?.username || null,
      })),
    };
  }

  private async deliveryReport(args: any) {
    const r = resolveRange(args.from, args.to);
    const [deliveries, cashOutstanding] = await Promise.all([
      this.prisma.delivery.findMany({
        where: { order: { created_at: { gte: r.gte, lte: r.lte } } },
        include: {
          rider: { select: { username: true } },
          order: { select: { order_id: true, created_at: true, total_price: true } },
        },
      }),
      // เงินสดที่ยังไม่ยืนยันรับ (ไม่จำกัดช่วงเวลา เพราะเป็นยอดค้างปัจจุบัน)
      this.prisma.delivery.findMany({
        where: { cash_amount: { gt: 0 }, cash_status: { in: ['PENDING', 'SUBMITTED'] }, delivery_status: { not: 'CANCELLED' } },
        include: { rider: { select: { username: true } } },
      }),
    ]);

    const byStatus: Record<string, number> = {};
    deliveries.forEach((d) => (byStatus[d.delivery_status] = (byStatus[d.delivery_status] || 0) + 1));
    const done = deliveries.filter((d) => d.delivery_status === 'DELIVERED');

    const riders: Record<string, { jobs: number; rider_fee: number; km: number; mins: number[] }> = {};
    done.forEach((d) => {
      const k = d.rider?.username || 'ไม่ระบุ';
      riders[k] = riders[k] || { jobs: 0, rider_fee: 0, km: 0, mins: [] };
      riders[k].jobs += 1;
      riders[k].rider_fee = round(riders[k].rider_fee + num(d.rider_fee));
      riders[k].km = round(riders[k].km + num(d.distance_km));
      const m = minutesBetween(d.picked_up_at, d.delivered_at);
      if (m != null) riders[k].mins.push(m);
    });

    return {
      range: { from: r.from, to: r.to },
      total_deliveries: deliveries.length,
      by_status: byStatus,
      delivered: done.length,
      total_rider_fee: round(done.reduce((s, d) => s + num(d.rider_fee), 0)),
      avg_distance_km: avg(done.map((d) => num(d.distance_km))),
      avg_minutes_order_to_delivered: avg(done.map((d) => minutesBetween(d.order?.created_at, d.delivered_at)).filter((x): x is number => x != null)),
      avg_minutes_pickup_to_delivered: avg(done.map((d) => minutesBetween(d.picked_up_at, d.delivered_at)).filter((x): x is number => x != null)),
      riders: Object.entries(riders).map(([name, v]) => ({
        rider: name,
        jobs: v.jobs,
        rider_fee: v.rider_fee,
        total_km: v.km,
        avg_ride_minutes: avg(v.mins),
      })),
      cash_outstanding_now: {
        note: 'เงินสดที่ไรเดอร์เก็บจากลูกค้าแต่ร้านยังไม่ยืนยันรับ (PENDING = ยังไม่ส่ง, SUBMITTED = ส่งแล้วรอยืนยัน)',
        total: round(cashOutstanding.reduce((s, d) => s + num(d.cash_amount), 0)),
        items: cashOutstanding.map((d) => ({
          delivery_id: d.delivery_id,
          order_id: d.order_id,
          rider: d.rider?.username || null,
          amount: num(d.cash_amount),
          cash_status: d.cash_status,
        })),
      },
    };
  }

  private async reviews(args: any) {
    const r = resolveRange(args.from, args.to, 90);
    const limit = Math.min(Math.max(Number(args.limit) || 30, 1), 100);
    const all = await this.prisma.order.findMany({
      where: { rating: { not: null }, reviewed_at: { gte: r.gte, lte: r.lte } },
      select: {
        order_id: true,
        rating: true,
        review_comment: true,
        reviewed_at: true,
        order_type: true,
        order_items: { select: { menu: { select: { menu_name: true } } } },
      },
      orderBy: { reviewed_at: 'desc' },
    });
    const dist: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    all.forEach((o) => (dist[String(o.rating)] = (dist[String(o.rating)] || 0) + 1));
    const shown = args.max_rating ? all.filter((o) => (o.rating || 0) <= Number(args.max_rating)) : all;
    return {
      range: { from: r.from, to: r.to },
      review_count: all.length,
      average_rating: avg(all.map((o) => o.rating || 0)),
      distribution: dist,
      reviews: shown.slice(0, limit).map((o) => ({
        order_id: o.order_id,
        rating: o.rating,
        comment: o.review_comment,
        date: bkkDateTime(o.reviewed_at),
        order_type: o.order_type,
        menus: [...new Set(o.order_items.map((i) => i.menu?.menu_name).filter(Boolean))],
      })),
    };
  }

  private async kitchenPerformance(args: any) {
    const r = resolveRange(args.from, args.to, 7);
    const [orders, queue] = await Promise.all([
      this.prisma.order.findMany({
        where: { created_at: { gte: r.gte, lte: r.lte }, cooking_started_at: { not: null } },
        select: { order_id: true, created_at: true, cooking_started_at: true, cooked_at: true, order_type: true },
      }),
      this.prisma.order.findMany({
        where: { status: { in: ['PENDING', 'COOKING', 'READY'] } },
        select: {
          order_id: true,
          status: true,
          order_type: true,
          created_at: true,
          table: { select: { table_number: true } },
          order_items: { select: { quantity: true, notes: true, menu: { select: { menu_name: true } } } },
        },
        orderBy: { created_at: 'asc' },
      }),
    ]);
    const wait = orders.map((o) => minutesBetween(o.created_at, o.cooking_started_at)).filter((x): x is number => x != null);
    const cook = orders.map((o) => ({ id: o.order_id, m: minutesBetween(o.cooking_started_at, o.cooked_at) })).filter((x) => x.m != null);
    const now = new Date();
    return {
      range: { from: r.from, to: r.to },
      orders_measured: orders.length,
      avg_wait_minutes_before_cooking: avg(wait),
      avg_cooking_minutes: avg(cook.map((x) => x.m as number)),
      slowest_orders: cook.sort((a, b) => (b.m as number) - (a.m as number)).slice(0, 5).map((x) => ({ order_id: x.id, cooking_minutes: x.m })),
      current_queue: queue.map((o) => ({
        order_id: o.order_id,
        status: o.status,
        order_type: o.order_type,
        table: o.table?.table_number || null,
        waiting_minutes: minutesBetween(o.created_at, now),
        items: o.order_items.map((i) => `${i.menu?.menu_name} x${i.quantity}${i.notes ? ` (${i.notes})` : ''}`),
      })),
    };
  }

  private async orders(args: any) {
    const limit = Math.min(Math.max(Number(args.limit) || 20, 1), 50);
    let where: any;
    if (args.order_id) {
      where = { order_id: Number(args.order_id) };
    } else {
      const r = resolveRange(args.from, args.to, 7);
      where = {
        created_at: { gte: r.gte, lte: r.lte },
        ...(args.status ? { status: String(args.status).toUpperCase() } : {}),
        ...(args.order_type ? { order_type: String(args.order_type).toUpperCase() } : {}),
      };
    }
    const [count, list] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          user: { select: { username: true } },
          table: { select: { table_number: true } },
          promotion: { select: { code: true } },
          order_items: {
            include: { menu: { select: { menu_name: true } }, order_item_options: { select: { option_name: true, price: true } } },
          },
          transaction: { select: { amount: true, payment_method: true, payment_status: true, paid_at: true } },
          delivery: { select: { delivery_status: true, distance_km: true, rider_fee: true, rider: { select: { username: true } } } },
        },
      }),
    ]);
    return {
      matched_count: count,
      showing: list.length,
      orders: list.map((o) => ({
        order_id: o.order_id,
        created_at: bkkDateTime(o.created_at),
        status: o.status,
        order_type: o.order_type,
        customer: o.user?.username || null,
        table: o.table?.table_number || null,
        promo_code: o.promotion?.code || null,
        subtotal: num(o.subtotal),
        discount: num(o.discount_amount),
        delivery_fee: num(o.delivery_fee),
        total: num(o.total_price),
        notes: o.order_notes,
        items: o.order_items.map((i) => ({
          menu: i.menu?.menu_name,
          qty: i.quantity,
          unit_price: num(i.unit_price),
          options: i.order_item_options.map((x) => x.option_name),
          notes: i.notes,
        })),
        payments: o.transaction.map((t) => ({
          amount: num(t.amount),
          method: t.payment_method,
          status: t.payment_status,
          paid_at: bkkDateTime(t.paid_at),
        })),
        delivery: o.delivery
          ? {
              status: o.delivery.delivery_status,
              rider: o.delivery.rider?.username || null,
              distance_km: num(o.delivery.distance_km),
              rider_fee: num(o.delivery.rider_fee),
            }
          : null,
        rating: o.rating,
        review: o.review_comment,
      })),
    };
  }

  private async tables() {
    const tables = await this.prisma.table.findMany({
      orderBy: { table_number: 'asc' },
      include: {
        orders: {
          where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } },
          select: { order_id: true, status: true, total_price: true, created_at: true },
        },
      },
    });
    return {
      total_tables: tables.length,
      available: tables.filter((t) => t.status === 'AVAILABLE').length,
      tables: tables.map((t) => ({
        table_number: t.table_number,
        capacity: t.capacity,
        status: t.status,
        open_orders: t.orders.map((o) => ({
          order_id: o.order_id,
          status: o.status,
          total: num(o.total_price),
          since: bkkDateTime(o.created_at),
        })),
        open_total: round(t.orders.reduce((s, o) => s + num(o.total_price), 0)),
      })),
    };
  }

  private async promotions(args: any) {
    const r = resolveRange(args.from, args.to);
    const now = new Date();
    const [promos, orders, claims] = await Promise.all([
      this.prisma.promotion.findMany({
        where: args.include_expired ? undefined : { expiry_date: { gte: now } },
        orderBy: { expiry_date: 'asc' },
      }),
      this.prisma.order.findMany({
        where: { promo_id: { not: null }, status: { not: 'CANCELLED' }, created_at: { gte: r.gte, lte: r.lte } },
        select: { promo_id: true, discount_amount: true, total_price: true },
      }),
      this.prisma.userClaimedPromotion.groupBy({ by: ['promo_id'], _count: { _all: true } }).catch(() => []),
    ]);
    const claimMap = new Map<number, number>((claims as any[]).map((c) => [c.promo_id, c._count._all]));
    return {
      range: { from: r.from, to: r.to },
      promotions: promos.map((p) => {
        const used = orders.filter((o) => o.promo_id === p.promo_id);
        return {
          code: p.code,
          discount: `${num(p.discount_value)} ${p.discount_type === 'PERCENT' ? '%' : 'บาท'}`,
          min_order: num(p.min_order_price),
          start_date: bkkDate(p.start_date),
          expiry_date: bkkDate(p.expiry_date),
          is_active: p.is_active && p.expiry_date >= now,
          times_claimed: claimMap.get(p.promo_id) || 0,
          times_used_in_range: used.length,
          total_discount_given: round(used.reduce((s, o) => s + num(o.discount_amount), 0)),
          sales_with_code: round(used.reduce((s, o) => s + num(o.total_price), 0)),
        };
      }),
    };
  }

  private async customerInsights(args: any) {
    const r = resolveRange(args.from, args.to);
    const limit = Math.min(Math.max(Number(args.limit) || 10, 1), 50);
    const orders = await this.prisma.order.findMany({
      where: { created_at: { gte: r.gte, lte: r.lte }, status: { not: 'CANCELLED' }, user_id: { not: null } },
      select: { user_id: true, total_price: true, user: { select: { username: true } } },
    });
    const ids = [...new Set(orders.map((o) => o.user_id as number))];
    const previous = ids.length
      ? await this.prisma.order.groupBy({
          by: ['user_id'],
          where: { user_id: { in: ids }, created_at: { lt: r.gte }, status: { not: 'CANCELLED' } },
        })
      : [];
    const returning = new Set(previous.map((p) => p.user_id));
    const per = new Map<number, { name: string; orders: number; spent: number }>();
    orders.forEach((o) => {
      const s = per.get(o.user_id!) || { name: o.user?.username || `#${o.user_id}`, orders: 0, spent: 0 };
      s.orders += 1;
      s.spent = round(s.spent + num(o.total_price));
      per.set(o.user_id!, s);
    });
    const guestOrders = await this.prisma.order.count({
      where: { created_at: { gte: r.gte, lte: r.lte }, status: { not: 'CANCELLED' }, user_id: null },
    });
    const list = [...per.values()];
    return {
      range: { from: r.from, to: r.to },
      unique_customers: ids.length,
      new_customers: ids.filter((id) => !returning.has(id)).length,
      returning_customers: ids.filter((id) => returning.has(id)).length,
      guest_orders_without_account: guestOrders,
      avg_orders_per_customer: list.length ? round(orders.length / list.length) : 0,
      top_customers: list.sort((a, b) => b.spent - a.spent).slice(0, limit),
    };
  }

  private async storeSettings() {
    const s = await this.prisma.storeSetting.findFirst();
    if (!s) return { error: 'ไม่พบการตั้งค่าร้าน' };
    return {
      store_name: s.store_name,
      is_open: s.is_open,
      open_time: s.open_time,
      close_time: s.close_time,
      phone: s.phone,
      address: s.address,
      base_delivery_fee: num(s.base_delivery_fee),
      delivery_fee_per_km: num(s.delivery_fee_per_km),
      max_delivery_km: num(s.max_delivery_km),
      min_order_delivery: num(s.min_order_delivery),
      rider_fee: {
        base: num(s.base_rider_fee),
        free_km: num(s.rider_free_km),
        per_km: num(s.rider_fee_per_km),
        step_km: num(s.rider_fee_step_km),
        per_step: num(s.rider_fee_per_step),
      },
      fuel_daily_amount: num(s.fuel_daily_amount),
      fuel_tank_liters: num(s.fuel_tank_liters),
      vat_rate: num(s.vat_rate),
    };
  }
}
