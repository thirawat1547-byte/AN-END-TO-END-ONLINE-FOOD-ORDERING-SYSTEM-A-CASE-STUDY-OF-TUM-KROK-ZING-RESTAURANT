// src/reports/reports.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

@ApiTags('Reports & Database Views')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales-summary')
  @ApiOperation({ summary: 'ดึงข้อมูลสรุปยอดขายจาก ORDER_SUMMARIES_VIEW' })
  @ApiResponse({ status: 200, description: 'รายการสรุปยอดขายจาก Database View' })
  getOrderSummaries() {
    return this.reportsService.getOrderSummaries();
  }

  @Get('receipts')
  @ApiOperation({ summary: 'ดึงข้อมูลบิลและประวัติใบเสร็จจาก TRANSACTION_RECEIPTS_VIEW' })
  @ApiResponse({ status: 200, description: 'รายการใบเสร็จรับเงินสำหรับทำบิลและตรวจสอบการเงิน' })
  getReceipts() {
    return this.reportsService.getReceipts();
  }

  @Get('top-selling')
  @ApiOperation({ summary: 'ดึงข้อมูลเมนูยอดฮิตขายดีจาก TOP_SELLING_MENUS_VIEW' })
  @ApiResponse({ status: 200, description: 'สถิติเมนูขายดีและรายได้ต่อเมนู' })
  getTopSellingMenus() {
    return this.reportsService.getTopSellingMenus();
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'ดึงภาพรวมสถิติทางการเงินและยอดขายทั้งหมด' })
  @ApiResponse({ status: 200, description: 'ข้อมูลสรุปสำหรับหน้าแดชบอร์ด' })
  getDashboardAnalytics() {
    return this.reportsService.getDashboardAnalytics();
  }
}
