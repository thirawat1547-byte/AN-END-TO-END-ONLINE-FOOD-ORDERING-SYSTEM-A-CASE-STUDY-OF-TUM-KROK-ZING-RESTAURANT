// src/transactions/dto/verify-transaction.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class VerifyTransactionDto {
  @ApiProperty({ example: true, description: 'true = ยืนยันว่าเงินเข้าบัญชีแล้ว, false = ปฏิเสธ (ไม่พบยอดโอน)' })
  @IsBoolean()
  approve: boolean;

  @ApiPropertyOptional({ example: 'ไม่พบยอดเงินในบัญชี', description: 'หมายเหตุ (กรณีปฏิเสธ)' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;
}
