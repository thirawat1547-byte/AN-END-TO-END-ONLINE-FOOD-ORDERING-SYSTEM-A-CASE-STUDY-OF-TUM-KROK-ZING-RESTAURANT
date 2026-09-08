import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { MenusModule } from './menus/menus.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [MenusModule, AuthModule, OrdersModule, TransactionsModule], // <-- เพิ่ม OrdersModule ตรงนี้
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}