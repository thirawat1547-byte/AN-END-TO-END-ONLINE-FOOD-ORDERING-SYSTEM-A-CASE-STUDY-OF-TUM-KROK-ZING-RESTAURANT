import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateMenuDto {
  @ApiProperty({ example: 1, description: 'รหัสหมวดหมู่อาหาร' })
  @IsInt()
  category_id: number;

  @ApiProperty({ example: 'ส้มตำไทยไข่เค็ม', description: 'ชื่อเมนูอาหาร' })
  @IsString()
  menu_name: string;

  @ApiPropertyOptional({
    example: 'ตำไทยรสแซ่บ ใส่ไข่เค็มชิ้นโต ถั่วคั่วหอม',
    description: 'รายละเอียดเมนู',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 65.0, description: 'ราคา (บาท)' })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiPropertyOptional({
    example: '/images/somtum_egg.jpg',
    description: 'URL รูปภาพอาหาร',
  })
  @IsOptional()
  @IsString()
  image_url?: string;

  @ApiPropertyOptional({ example: 250, description: 'จำนวนแคลอรี่ (kcal)' })
  @IsOptional()
  @IsInt()
  calories?: number;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'สถานะเปิด/ปิดการขาย',
  })
  @IsOptional()
  @IsBoolean()
  is_available?: boolean;
}