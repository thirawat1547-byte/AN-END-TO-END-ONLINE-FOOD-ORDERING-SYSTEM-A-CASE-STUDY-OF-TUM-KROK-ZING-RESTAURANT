import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ เชื่อมต่อฐานข้อมูล MySQL สำเร็จ');

      // ตรวจสอบและเพิ่มคอลัมน์ notes ในตาราง OrderItem / ORDER_ITEMS แบบอัตโนมัติ
      const alterQueries = [
        'ALTER TABLE OrderItem ADD COLUMN notes TEXT NULL;',
        'ALTER TABLE ORDER_ITEMS ADD COLUMN notes TEXT NULL;',
      ];
      for (const query of alterQueries) {
        try {
          await this.$executeRawUnsafe(query);
          this.logger.log(`✅ เพิ่มคอลัมน์ notes สำเร็จ: ${query}`);
        } catch (e) {
          // ignore if table doesn't exist or column already exists
        }
      }

      // อัปเดตข้อมูลตัวอย่างสำหรับออเดอร์เดิม เพื่อให้หน้าจอห้องครัวแสดงข้อมูลตัวเลือกสวยงามทันที
      const sampleUpdates = [
        "UPDATE OrderItem SET notes = 'เผ็ดกลาง | ไข่ดาวไม่สุก' WHERE menu_id = 2 AND (notes IS NULL OR notes = '');",
        "UPDATE OrderItem SET notes = 'เผ็ดมาก | ไม่ใส่ผักชี | กุ้งสุกปานกลาง' WHERE menu_id = 9 AND (notes IS NULL OR notes = '');",
        "UPDATE ORDER_ITEMS SET notes = 'เผ็ดกลาง | ไข่ดาวไม่สุก' WHERE menu_id = 2 AND (notes IS NULL OR notes = '');",
        "UPDATE ORDER_ITEMS SET notes = 'เผ็ดมาก | ไม่ใส่ผักชี | กุ้งสุกปานกลาง' WHERE menu_id = 9 AND (notes IS NULL OR notes = '');",
      ];
      for (const updateSql of sampleUpdates) {
        try {
          await this.$executeRawUnsafe(updateSql);
        } catch (e) {
          // ignore
        }
      }

      // ซิงค์สถานะโต๊ะตามออเดอร์จริงที่มีอยู่ในระบบ
      try {
        await this.$executeRawUnsafe(`
          UPDATE TABLES t
          SET t.status = 'OCCUPIED'
          WHERE EXISTS (
            SELECT 1 FROM ORDERS o
            WHERE o.table_id = t.table_id
            AND o.status IN ('PENDING', 'COOKING', 'READY', 'PAID')
          );
        `);
      } catch (e) {}

      // สร้างหรืออัปเดต Database Views ให้สมบูรณ์ตรงตาม Schema
      const viewQueries = [
        `CREATE OR REPLACE VIEW ORDER_SUMMARIES_VIEW AS
         SELECT 
             o.order_id, 
             t.table_number, 
             o.total_price, 
             o.status, 
             o.created_at AS order_date
         FROM ORDERS o
         LEFT JOIN TABLES t ON o.table_id = t.table_id;`,

        `CREATE OR REPLACE VIEW TRANSACTION_RECEIPTS_VIEW AS
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
         LEFT JOIN USERS u ON o.user_id = u.user_id;`,

        `CREATE OR REPLACE VIEW TOP_SELLING_MENUS_VIEW AS
         SELECT 
             m.menu_id,
             m.menu_name AS menu_name,
             COALESCE(c.category_name, 'ทั่วไป') AS category_name,
             CAST(COALESCE(SUM(oi.quantity), 0) AS SIGNED) AS total_sold,
             CAST(COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS DECIMAL(10,2)) AS total_revenue
         FROM MENUS m
         LEFT JOIN CATEGORIES c ON m.category_id = c.category_id
         LEFT JOIN ORDER_ITEMS oi ON m.menu_id = oi.menu_id
         GROUP BY m.menu_id, m.menu_name, c.category_name;`,
      ];

      for (const vSql of viewQueries) {
        try {
          await this.$executeRawUnsafe(vSql);
        } catch (e) {
          // ignore
        }
      }
    } catch (err) {
      this.logger.error(`⚠️ ไม่สามารถเชื่อมต่อฐานข้อมูล MySQL (${err.message}) - โปรดตรวจสอบว่า MySQL รันอยู่`);
    }
  }
}