// src/transactions/transactions.controller.ts
import { Controller, Post, Get, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

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