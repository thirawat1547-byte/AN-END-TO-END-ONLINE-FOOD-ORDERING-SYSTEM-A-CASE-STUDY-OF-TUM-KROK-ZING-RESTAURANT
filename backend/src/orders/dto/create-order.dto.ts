// src/orders/dto/create-order.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class OrderItemDto {
  @ApiProperty({ example: 5, description: 'ID ของเมนูอาหาร' })
  @IsInt()
  @IsNotEmpty()
  menu_id: number;

  @ApiProperty({ example: 2, description: 'จำนวนจาน' })
  @IsInt()
  @Min(1, { message: 'จำนวนต้องไม่ต่ำกว่า 1' })
  quantity: number;

  @ApiPropertyOptional({ example: 'เผ็ดน้อย ไม่ใส่ผงชูรส', description: 'รายละเอียดเพิ่มเติม' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: 'กับข้าว', description: 'รูปแบบอาหาร: กับข้าว หรือ ราดข้าว' })
  @IsString()
  @IsOptional()
  dish_type?: string;

  @ApiPropertyOptional({ example: 'กับข้าว', description: 'รูปแบบอาหาร: กับข้าว หรือ ราดข้าว (alias)' })
  @IsString()
  @IsOptional()
  dishType?: string;
}

export class CreateOrderDto {
  @ApiPropertyOptional({ example: 1, description: 'ID โต๊ะที่นั่งทาน (กรณีสั่งทานที่ร้าน)' })
  @IsInt()
  @IsOptional()
  table_id?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID ลูกค้า (กรณีสั่งออนไลน์หรือล็อกอิน)' })
  @IsInt()
  @IsOptional()
  user_id?: number;

  @ApiProperty({ type: [OrderItemDto], description: 'รายการเมนูอาหารที่สั่ง' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
  @ApiPropertyOptional({
    example: 'DINE_IN',
    enum: ['DINE_IN', 'TAKEAWAY', 'DELIVERY'],
    description: 'ประเภทการสั่งซื้อ',
    default: 'DINE_IN',
  })
  @IsString()
  @IsOptional()
  order_type?: string;

  @ApiPropertyOptional({ example: 1, description: 'ID โปรโมชันส่วนลดที่ใช้ (เฉพาะสั่งออนไลน์)' })
  @IsInt()
  @IsOptional()
  promo_id?: number;

  @ApiPropertyOptional({ example: 'ZING50', description: 'รหัสโค้ดโปรโมชัน (เฉพาะสั่งออนไลน์)' })
  @IsString()
  @IsOptional()
  promo_code?: string;
}