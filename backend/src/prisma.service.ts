import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ เชื่อมต่อฐานข้อมูล MySQL สำเร็จ');
    } catch (err) {
      this.logger.error(`⚠️ ไม่สามารถเชื่อมต่อฐานข้อมูล MySQL (${err?.message}) - โปรดตรวจสอบว่า MySQL รันอยู่`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('🔌 ปิดการเชื่อมต่อฐานข้อมูล MySQL เรียบร้อย');
  }
}
