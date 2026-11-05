import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { QueryFinanceReportDto } from './dto/query-finance-report.dto';
import { FinanceReportResponseDto } from './dto/finance-report-response.dto';

@ApiTags('Reports & Database Views')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'KITCHEN')
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

  @Get('riders')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'ดึงรายงานสรุปผลการปฏิบัติงานและการนำส่งเงินสดของไรเดอร์ (เฉพาะ Admin)' })
  @ApiQuery({ name: 'from', required: false, type: String, description: 'วันที่เริ่มต้น เช่น 2026-11-01 หรือ ISO 8601' })
  @ApiQuery({ name: 'to', required: false, type: String, description: 'วันที่สิ้นสุด เช่น 2026-11-30 หรือ ISO 8601' })
  @ApiResponse({ status: 200, description: 'ดึงรายงานสรุปไรเดอร์สำเร็จ' })
  @ApiResponse({ status: 401, description: 'ไม่ได้เข้าสู่ระบบ (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์เข้าถึง (เฉพาะ Admin)' })
  getRiderReport(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reportsService.getRiderReport({ from, to });
  }

  @Get('finance')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'ดึงรายงานสรุปการเงินและกำไรสุทธิ (Financial & Net Profit Report)',
    description: 'คำนวณรายรับ (แยกตาม CARD, PROMPTPAY, CASH), รายจ่าย (วัตถุดิบ, ค่าน้ำมัน, ค่ารอบไรเดอร์, ค่าธรรมเนียม Stripe) และกำไรสุทธิ พร้อม Time-series breakdown สำหรับทำกราฟ (เฉพาะ Admin)',
  })
  @ApiResponse({
    status: 200,
    description: 'ดึงรายงานสรุปการเงินและกำไรสุทธิสำเร็จ',
    type: FinanceReportResponseDto,
  })
  @ApiResponse({ status: 401, description: 'ไม่ได้เข้าสู่ระบบ (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์เข้าถึง (เฉพาะ Admin)' })
  getFinanceReport(@Query() query: QueryFinanceReportDto) {
    return this.reportsService.getFinanceReport(query);
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
