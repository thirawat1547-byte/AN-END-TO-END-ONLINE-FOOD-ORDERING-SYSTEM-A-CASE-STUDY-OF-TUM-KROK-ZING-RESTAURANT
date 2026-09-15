import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ เชื่อมต่อฐานข้อมูล MySQL สำเร็จ');
    } catch (err) {
      this.logger.error(`⚠️ ไม่สามารถเชื่อมต่อฐานข้อมูล MySQL (${err.message}) - โปรดตรวจสอบว่า MySQL รันอยู่`);
    }
  }
}