// src/orders/dto/create-order.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class OrderItemOptionDto {
  @ApiPropertyOptional({ example: 1, description: 'ID ของ Option' })
  @IsInt()
  @IsOptional()
  option_id?: number;

  @ApiProperty({ example: 'ไข่ดาวไม่สุก', description: 'ชื่อของ Option' })
  @IsString()
  @IsNotEmpty()
  option_name: string;

  @ApiPropertyOptional({ example: 10, description: 'ราคาบวกเพิ่ม (บาท)' })
  @IsOptional()
  price?: number;
}

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

  @ApiPropertyOptional({ type: [OrderItemOptionDto], description: 'ท็อปปิ้งและตัวเลือกเสริมที่เลือก' })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OrderItemOptionDto)
  options?: OrderItemOptionDto[];
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

  @ApiPropertyOptional({ example: 150, description: 'ยอดรวมอาหารก่อนหักส่วนลดและค่าส่ง' })
  @IsOptional()
  subtotal?: number;

  @ApiPropertyOptional({ example: 20, description: 'ส่วนลดโปรโมชั่น' })
  @IsOptional()
  discount_amount?: number;

  @ApiPropertyOptional({ example: 30, description: 'ค่าจัดส่ง' })
  @IsOptional()
  delivery_fee?: number;

  @ApiPropertyOptional({ example: '123/45 ถนนแจ้งวัฒนะ แขวงทุ่งสองห้อง เขตหลักสี่ กทม.', description: 'ที่อยู่จัดส่ง' })
  @IsString()
  @IsOptional()
  delivery_address?: string;

  @ApiPropertyOptional({ example: '081-234-5678', description: 'เบอร์โทรผู้รับสำหรับจัดส่ง' })
  @IsString()
  @IsOptional()
  delivery_phone?: string;

  @ApiPropertyOptional({ example: 13.87613, description: 'ละติจูดจุดส่งอาหาร (GPS)' })
  @IsNumber()
  @IsOptional()
  delivery_lat?: number;

  @ApiPropertyOptional({ example: 100.59630, description: 'ลองจิจูดจุดส่งอาหาร (GPS)' })
  @IsNumber()
  @IsOptional()
  delivery_lng?: number;

  @ApiPropertyOptional({ example: 'ฝากไว้ที่ล็อบบี้ชั้น 1', description: 'หมายเหตุเพิ่มเติมของคำสั่งซื้อ' })
  @IsString()
  @IsOptional()
  order_notes?: string;

  @ApiPropertyOptional({ example: 'คุณณัฐวุฒิ ใจดี', description: 'ชื่อผู้รับอาหาร (สำหรับงานจัดส่ง)' })
  @IsString()
  @IsOptional()
  customer_name?: string;
}