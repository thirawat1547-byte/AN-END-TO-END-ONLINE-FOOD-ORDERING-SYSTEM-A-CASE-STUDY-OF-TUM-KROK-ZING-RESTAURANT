import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MenusModule } from './menus/menus.module';
import { OrdersModule } from './orders/orders.module';
import { TransactionsModule } from './transactions/transactions.module';
import { TablesModule } from './tables/tables.module';
import { PrismaService } from './prisma.service';
import { IngredientsModule } from './ingredients/ingredients.module';
import { PromotionsModule } from './promotions/promotions.module';
@Module({
  imports: [
    AuthModule,
    MenusModule,
    OrdersModule,
    TransactionsModule,
    TablesModule,
    IngredientsModule,
    PromotionsModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}