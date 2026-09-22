"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("./auth/auth.module");
const menus_module_1 = require("./menus/menus.module");
const orders_module_1 = require("./orders/orders.module");
const transactions_module_1 = require("./transactions/transactions.module");
const tables_module_1 = require("./tables/tables.module");
const prisma_service_1 = require("./prisma.service");
const ingredients_module_1 = require("./ingredients/ingredients.module");
const promotions_module_1 = require("./promotions/promotions.module");
const reports_module_1 = require("./reports/reports.module");
const settings_module_1 = require("./settings/settings.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            menus_module_1.MenusModule,
            orders_module_1.OrdersModule,
            transactions_module_1.TransactionsModule,
            tables_module_1.TablesModule,
            ingredients_module_1.IngredientsModule,
            promotions_module_1.PromotionsModule,
            reports_module_1.ReportsModule,
            settings_module_1.SettingsModule,
        ],
        providers: [prisma_service_1.PrismaService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map