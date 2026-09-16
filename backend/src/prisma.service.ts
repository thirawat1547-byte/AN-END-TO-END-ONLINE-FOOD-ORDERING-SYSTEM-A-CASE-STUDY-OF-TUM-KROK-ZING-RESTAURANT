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
    } catch (err) {
      this.logger.error(`⚠️ ไม่สามารถเชื่อมต่อฐานข้อมูล MySQL (${err.message}) - โปรดตรวจสอบว่า MySQL รันอยู่`);
    }
  }
}