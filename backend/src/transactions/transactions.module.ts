// src/transactions/transactions.module.ts
import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { PrismaService } from '../prisma.service';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [OrdersModule], // ใช้ OrdersService ยกเลิกออเดอร์ + แจ้งครัวผ่าน WebSocket เมื่อไม่พบยอดโอน
  controllers: [TransactionsController],
  providers: [TransactionsService, PrismaService],
})
export class TransactionsModule {}