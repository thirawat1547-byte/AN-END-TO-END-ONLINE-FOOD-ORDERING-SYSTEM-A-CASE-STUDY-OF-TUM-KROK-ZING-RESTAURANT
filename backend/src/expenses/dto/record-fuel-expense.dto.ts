import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class RecordFuelExpenseDto {
  @ApiProperty({
    example: 38.5,
    description: 'ราคาน้ำมันต่อลิตร (บาท/ลิตร, ตัวเลขมากกว่า 0)',
  })
  @IsNumber()
  @IsPositive({ message: 'ราคาน้ำมันต่อลิตรต้องมากกว่า 0' })
  @IsNotEmpty({ message: 'กรุณาระบุราคาน้ำมันต่อลิตร' })
  @Type(() => Number)
  price_per_liter: number;

  @ApiPropertyOptional({
    example: '2026-11-05',
    description: 'วันที่บันทึก (YYYY-MM-DD, ถ้าไม่ระบุจะใช้วันที่ปัจจุบันตามเวลาไทย)',
  })
  @IsString()
  @IsOptional()
  log_date?: string;
}

