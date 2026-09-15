import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePromotionDto {
  @ApiProperty({ example: 'ZING50', description: 'รหัสโค้ดโปรโมชัน (ไม่ซ้ำ)' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    example: 'FIXED',
    description: 'ประเภทส่วนลด (PERCENTAGE หรือ FIXED)',
  })
  @IsString()
  @IsNotEmpty()
  discount_type: string;

  @ApiProperty({ example: 50, description: 'มูลค่าส่วนลด (เปอร์เซ็นต์หรือบาท)' })
  @IsNumber()
  @IsNotEmpty()
  discount_value: number;

  @ApiProperty({ example: 300, description: 'ยอดสั่งซื้อขั้นต่ำที่ใช้ได้', required: false })
  @IsNumber()
  @IsOptional()
  min_order_price?: number;

  @ApiProperty({ example: '2026-12-31T23:59:59Z', description: 'วันหมดอายุโปรโมชัน' })
  @IsDateString()
  @IsNotEmpty()
  expiry_date: string;
}