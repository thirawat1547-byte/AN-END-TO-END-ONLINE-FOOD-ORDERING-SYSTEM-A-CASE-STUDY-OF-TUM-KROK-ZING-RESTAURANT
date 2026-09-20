// src/reports/reports.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly prisma: PrismaService) {}

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

    const totalRevenue = (summaries as any[]).reduce(
      (sum: number, s: any) => sum + Number(s.total_price || 0),
      0,
    );
    const totalOrders = (summaries as any[]).length;

    return {
      totalRevenue,
      totalOrders,
      summaries,
      topSelling,
      receipts,
    };
  }
}
