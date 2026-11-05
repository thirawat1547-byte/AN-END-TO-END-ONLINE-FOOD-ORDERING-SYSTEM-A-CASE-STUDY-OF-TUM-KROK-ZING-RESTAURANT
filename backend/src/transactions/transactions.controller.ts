// src/transactions/transactions.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  ForbiddenException,
  Headers,
  BadRequestException,
  RawBodyRequest,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { VerifyTransactionDto } from './dto/verify-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// อนุญาตเฉพาะพนักงานร้าน (ADMIN / KITCHEN / STAFF)
function assertStaff(req: any) {
  const role = String(req?.user?.role || '').toUpperCase();
  if (role !== 'ADMIN' && role !== 'KITCHEN' && role !== 'STAFF') {
    throw new ForbiddenException('เฉพาะผู้ดูแลร้านหรือพนักงานเท่านั้นที่ยืนยันการชำระเงินได้');
  }
}

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF', 'CUSTOMER')
  @ApiBearerAuth('JWT-auth')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'บันทึกการชำระเงินของออร์เดอร์ (ADMIN / STAFF / CUSTOMER)' })
  @ApiResponse({ status: 201, description: 'บันทึกการชำระเงินสำเร็จ' })
  @ApiResponse({ status: 400, description: 'ข้อมูลไม่ถูกต้องหรือออเดอร์ปิดบิลแล้ว' })
  @ApiResponse({ status: 401, description: 'ไม่ได้เข้าสู่ระบบหรือไม่ได้รับอนุญาต' })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์บันทึกการชำระเงินของคำสั่งซื้อผู้อื่น' })
  @ApiResponse({ status: 404, description: 'ไม่พบคำสั่งซื้อ' })
  create(@Body() createTransactionDto: CreateTransactionDto, @Req() req: any) {
    return this.transactionsService.create(createTransactionDto, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ดูประวัติรายการชำระเงินทั้งหมด (ADMIN)' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'รายการโอนพร้อมเพย์ที่รอแอดมินตรวจสอบ (ADMIN/KITCHEN)' })
  findPendingPromptPay(@Req() req: any) {
    assertStaff(req);
    return this.transactionsService.findPendingPromptPay();
  }

  @Patch(':id/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'สร้าง Stripe Payment Intent สำหรับคำนวณยอดชำระ (ต้องยืนยันตัวตน)' })
  @ApiParam({ name: 'orderId', type: Number, description: 'รหัสคำสั่งซื้อ (Order ID)' })
  @ApiResponse({ status: 201, description: 'สร้าง Payment Intent สำเร็จ ได้รับ clientSecret' })
  @ApiResponse({ status: 400, description: 'ยอดชำระไม่ถูกต้องหรือคำสั่งซื้อมีสถานะไม่ถูกต้อง' })
  @ApiResponse({ status: 401, description: 'ไม่ได้เข้าสู่ระบบหรือไม่ได้รับอนุญาต (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์เข้าถึงคำสั่งซื้อของผู้อื่น' })
  @ApiResponse({ status: 404, description: 'ไม่พบคำสั่งซื้อ' })
  @ApiResponse({ status: 500, description: 'ระบบชำระเงิน Stripe ยังไม่ได้ถูกตั้งค่าคีย์หรือมีข้อผิดพลาดภายใน' })
  createStripeIntent(@Param('orderId', ParseIntPipe) orderId: number, @Req() req: any) {
    return this.transactionsService.createStripeIntent(orderId, req.user);
  }

  @Post('stripe/confirm/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ยืนยันสถานะการชำระเงินผ่าน Stripe จริง' })
  @ApiParam({ name: 'orderId', type: Number, description: 'รหัสคำสั่งซื้อ (Order ID)' })
  @ApiResponse({ status: 200, description: 'ยืนยันการชำระเงินสำเร็จ ปรับสถานะเป็น PAID' })
  @ApiResponse({ status: 400, description: 'การชำระเงินยังไม่สำเร็จ หรือข้อมูลไม่ถูกต้อง' })
  @ApiResponse({ status: 401, description: 'ไม่ได้เข้าสู่ระบบหรือไม่ได้รับอนุญาต' })
  @ApiResponse({ status: 404, description: 'ไม่พบคำสั่งซื้อ' })
  confirmStripePayment(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body('paymentIntentId') paymentIntentId?: string,
  ) {
    return this.transactionsService.confirmStripePayment(orderId, paymentIntentId);
  }

  @Post('stripe/webhook')
  @ApiOperation({
    summary: 'รับการแจ้งเตือนสถานะการชำระเงินจาก Stripe Webhook พร้อมตรวจสอบ Signature',
    description: 'รับ Raw Body และ stripe-signature เพื่อตรวจสอบความถูกต้องจาก Stripe ก่อนอัปเดตสถานะการชำระเงิน',
  })
  @ApiResponse({ status: 200, description: 'รับและประมวลผล Webhook เรียบร้อย' })
  @ApiResponse({ status: 400, description: 'Stripe signature หรือ Raw body ไม่ถูกต้อง' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!signature) {
      throw new BadRequestException('ไม่พบ Stripe signature ใน Request Header (stripe-signature)');
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('ไม่พบ Raw Body ใน Request');
    }

    return this.transactionsService.handleStripeWebhook(rawBody, signature);
  }

  @Post('stripe/confirm-test/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth('JWT-auth')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'จำลองการชำระเงินผ่าน Stripe สำเร็จ (สำหรับทดสอบ Flow - ADMIN/STAFF)' })
  @ApiParam({ name: 'orderId', type: Number, description: 'รหัสคำสั่งซื้อ (Order ID)' })
  @ApiResponse({ status: 200, description: 'ปรับสถานะ Transaction เป็น COMPLETED และ Order เป็น PAID เรียบร้อย' })
  @ApiResponse({ status: 404, description: 'ไม่พบคำสั่งซื้อ' })
  confirmStripeTest(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.transactionsService.confirmStripePaymentTest(orderId);
  }
}
