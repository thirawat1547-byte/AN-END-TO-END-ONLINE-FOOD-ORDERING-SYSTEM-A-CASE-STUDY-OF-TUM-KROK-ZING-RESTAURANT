// src/transactions/transactions.controller.ts
import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@ApiTags('Transactions (การชำระเงิน)')
// เปลี่ยนจาก @Controller('api/v1/transactions') เป็น:
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
}