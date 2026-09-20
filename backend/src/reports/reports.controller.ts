// src/reports/reports.controller.ts
import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
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

  @Get('export-csv')
  @ApiOperation({ summary: 'ดาวน์โหลดไฟล์รายงาน Excel (CSV) ส่งตรงจากเซิร์ฟเวอร์พร้อม Content-Disposition' })
  async exportCsv(@Res() res: Response) {
    const csvContent = await this.reportsService.generateCsv();
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `TumKrokZing_SalesReport_${dateStr}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csvContent);
  }
}
