// src/transactions/transactions.controller.ts
import { Controller, Post, Get, Patch, Body, Param, ParseIntPipe, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { VerifyTransactionDto } from './dto/verify-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

// อนุญาตเฉพาะพนักงานร้าน (ADMIN / KITCHEN)
function assertStaff(req: any) {
  const role = String(req?.user?.role || '').toUpperCase();
  if (role !== 'ADMIN' && role !== 'KITCHEN') {
    throw new ForbiddenException('เฉพาะผู้ดูแลร้านหรือพนักงานเท่านั้นที่ยืนยันการชำระเงินได้');
  }
}

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'บันทึกการชำระเงินและปิดบิลออร์เดอร์' })
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  @ApiOperation({ summary: 'ดูประวัติรายการชำระเงินทั้งหมด' })
  findAll() {
    return this.transactionsService.findAll();
  }

  // ---------- PromptPay: ลูกค้าแจ้งโอน -> แอดมินตรวจยอดแล้วยืนยัน ----------

  @Post('promptpay/notify/:orderId')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'ลูกค้าแจ้งว่าโอนเงินผ่านพร้อมเพย์แล้ว (สร้างรายการรอตรวจสอบ)' })
  @ApiParam({ name: 'orderId', type: Number })
  notifyPromptPay(@Param('orderId', ParseIntPipe) orderId: number, @Req() req: any) {
    return this.transactionsService.notifyPromptPayTransfer(orderId, req.user);
  }

  @Get('promptpay/pending')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'รายการโอนพร้อมเพย์ที่รอแอดมินตรวจสอบ (ADMIN/KITCHEN)' })
  findPendingPromptPay(@Req() req: any) {
    assertStaff(req);
    return this.transactionsService.findPendingPromptPay();
  }

  @Patch(':id/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'แอดมินยืนยัน/ปฏิเสธยอดโอนพร้อมเพย์ หลังตรวจสอบบัญชีธนาคาร (ADMIN/KITCHEN)' })
  @ApiParam({ name: 'id', type: Number, description: 'รหัสรายการชำระเงิน (transaction_id)' })
  verifyPromptPay(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: VerifyTransactionDto,
    @Req() req: any,
  ) {
    assertStaff(req);
    return this.transactionsService.verifyPromptPay(id, dto.approve);
  }

  @Post('stripe/create-intent/:orderId')
  @ApiOperation({ summary: 'สร้าง Stripe Payment Intent สำหรับคำนวณยอดชำระ' })
  @ApiParam({ name: 'orderId', type: Number, description: 'รหัสคำสั่งซื้อ (Order ID)' })
  @ApiResponse({ status: 201, description: 'สร้าง Payment Intent สำเร็จ ได้รับ clientSecret' })
  @ApiResponse({ status: 404, description: 'ไม่พบคำสั่งซื้อ' })
  createStripeIntent(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.transactionsService.createStripeIntent(orderId);
  }

  @Post('stripe/confirm-test/:orderId')
  @ApiOperation({ summary: 'จำลองการชำระเงินผ่าน Stripe สำเร็จ (สำหรับทดสอบ Flow)' })
  @ApiParam({ name: 'orderId', type: Number, description: 'รหัสคำสั่งซื้อ (Order ID)' })
  @ApiResponse({ status: 200, description: 'ปรับสถานะ Transaction เป็น COMPLETED และ Order เป็น PAID เรียบร้อย' })
  @ApiResponse({ status: 404, description: 'ไม่พบคำสั่งซื้อ' })
  confirmStripeTest(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.transactionsService.confirmStripePaymentTest(orderId);
  }
}