import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateIngredientPurchaseDto {
  @ApiProperty({ example: 10.5, description: 'จำนวนที่ซื้อ (ตัวเลขมากกว่า 0)' })
  @IsNumber()
  @IsPositive({ message: 'จำนวนที่ซื้อต้องมากกว่า 0' })
  @IsNotEmpty({ message: 'กรุณาระบุจำนวนที่ซื้อ' })
  @Type(() => Number)
  quantity: number;

  @ApiProperty({ example: 350.0, description: 'ราคารวมทั้งหมด (บาท, ต้องไม่ต่ำกว่า 0)' })
  @IsNumber()
  @Min(0, { message: 'ราคารวมต้องไม่ต่ำกว่า 0 บาท' })
  @IsNotEmpty({ message: 'กรุณาระบุราคารวมทั้งหมด' })
  @Type(() => Number)
  total_price: number;

  @ApiPropertyOptional({ example: 'กก.', description: 'หน่วยนับ (ไม่ระบุจะใช้หน่วยนับเดิมของวัตถุดิบในระบบ)' })
  @IsString()
  @IsOptional()
  unit?: string;
}

