// src/transactions/dto/create-transaction.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({ example: 1, description: 'รหัสคำสั่งซื้อ (order_id)' })
  @IsNumber()
  @IsNotEmpty()
  order_id: number;

  @ApiProperty({ example: 130.00, description: 'ยอดเงินที่ชำระ' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: 'PROMPTPAY', description: 'วิธีชำระเงิน (CASH, PROMPTPAY)' })
  @IsString()
  @IsNotEmpty()
  payment_method: string;

  @ApiPropertyOptional({ example: 'https://example.com/slip.jpg', description: 'ลิงก์รูปสลิปโอนเงิน' })
  @IsString()
  @IsOptional()
  payment_slip_url?: string;
}