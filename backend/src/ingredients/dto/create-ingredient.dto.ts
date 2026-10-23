import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateIngredientDto {
  @ApiProperty({ example: 'เส้นมะละกอ', description: 'ชื่อวัตถุดิบ' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 10.5, description: 'จำนวนคงเหลือ' })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ example: 'กก.', description: 'หน่วยนับ (เช่น กก., ลิตร, ฟอง)' })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({ example: 2.0, description: 'จุดแจ้งเตือนขั้นต่ำ', required: false })
  @IsNumber()
  @IsOptional()
  min_quantity?: number;
}