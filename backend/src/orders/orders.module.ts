// src/orders/orders.module.ts
import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersGateway } from './orders.gateway';
import { PrismaService } from '../prisma.service';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [SettingsModule],
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService, OrdersGateway],
  exports: [OrdersService, OrdersGateway],
})
export class OrdersModule {}