import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RiderInfoDto {
  @ApiProperty({ example: 3, description: 'รหัสผู้ใช้งานไรเดอร์ (User ID)' })
  user_id: number;

  @ApiProperty({ example: 'somchai_rider', description: 'ชื่อผู้ใช้งาน (Username) ของไรเดอร์' })
  username: string;

  @ApiProperty({ example: 'somchai_rider', description: 'ชื่อ-นามสกุล หรือ Display Name ของไรเดอร์' })
  name: string;

  @ApiProperty({ example: '0812345678', description: 'เบอร์โทรศัพท์ของไรเดอร์สำหรับติดต่อ (phone)' })
  phone: string;

  @ApiProperty({ example: '0812345678', description: 'เบอร์โทรศัพท์ของไรเดอร์ (phone_number)' })
  phone_number: string;

  @ApiPropertyOptional({ example: 'RIDER', description: 'บทบาทของผู้ใช้งาน' })
  role?: string;
}

export class DeliveryInfoDto {
  @ApiProperty({ example: 10, description: 'รหัสงานจัดส่ง' })
  delivery_id: number;

  @ApiProperty({ example: 101, description: 'รหัสคำสั่งซื้อ' })
  order_id: number;

  @ApiPropertyOptional({ example: 3, description: 'รหัสไรเดอร์ผู้รับงาน (เป็น null หากยังไม่มีคนรับงาน)' })
  rider_id?: number | null;

  @ApiProperty({ example: 'ASSIGNED', description: 'สถานะการจัดส่ง (WAITING_RIDER, ASSIGNED, PICKED_UP, DELIVERED)' })
  delivery_status: string;

  @ApiProperty({ example: 'ลูกค้าสมหมาย', description: 'ชื่อผู้รับอาหาร' })
  customer_name: string;

  @ApiProperty({ example: '0891234567', description: 'เบอร์โทรศัพท์ผู้รับ' })
  customer_phone: string;

  @ApiProperty({ example: '123/45 ถนนพหลโยธิน แขวงลาดยาว เขตจตุจักร กทม.', description: 'ที่อยู่สำหรับจัดส่ง' })
  delivery_address: string;

  @ApiPropertyOptional({ example: 'ตึกสีฟ้า หน้าเซเว่น ซอย 3', description: 'จุดสังเกตสำหรับการจัดส่ง (Landmark)' })
  delivery_landmark?: string | null;

  @ApiPropertyOptional({ example: 13.7563, description: 'ละติจูดปลายทาง' })
  customer_lat?: number | null;

  @ApiPropertyOptional({ example: 100.5018, description: 'ลองจิจูดปลายทาง' })
  customer_lng?: number | null;

  @ApiPropertyOptional({ example: 2.5, description: 'ระยะทางจัดส่ง (กิโลเมตร)' })
  distance_km?: number;

  @ApiPropertyOptional({ example: 40.0, description: 'ค่าจัดส่งของไรเดอร์' })
  rider_fee?: number;

  @ApiPropertyOptional({ example: '/uploads/proof-101.jpg', description: 'รูปถ่ายหลักฐานการจัดส่ง' })
  proof_image_url?: string | null;

  @ApiPropertyOptional({ example: '2026-11-04T12:10:00.000Z', description: 'เวลาที่ไรเดอร์กดรับงาน' })
  assigned_at?: Date | null;

  @ApiPropertyOptional({ example: '2026-11-04T12:20:00.000Z', description: 'เวลาที่ไรเดอร์รับอาหารจากร้าน' })
  picked_up_at?: Date | null;

  @ApiPropertyOptional({ example: '2026-11-04T12:35:00.000Z', description: 'เวลาที่นำส่งสำเร็จ' })
  delivered_at?: Date | null;

  @ApiPropertyOptional({
    type: RiderInfoDto,
    nullable: true,
    description: 'ข้อมูลของไรเดอร์ที่รับงานจริง (เป็น null หากยังไม่มีไรเดอร์รับงาน)',
  })
  rider?: RiderInfoDto | null;
}

export class OrderItemMenuInfoDto {
  @ApiProperty({ example: 1, description: 'รหัสเมนูอาหาร' })
  menu_id: number;

  @ApiProperty({ example: 'ส้มตำไทย', description: 'ชื่อเมนูอาหาร' })
  menu_name: string;

  @ApiPropertyOptional({ example: 40, description: 'ราคาเมนูอาหาร' })
  price?: number;

  @ApiPropertyOptional({ example: '/images/tumtai.jpg', description: 'รูปภาพอาหาร' })
  image_url?: string | null;
}

export class OrderItemInfoDto {
  @ApiProperty({ example: 1, description: 'รหัสรายการอาหารในคำสั่งซื้อ' })
  order_item_id: number;

  @ApiProperty({ example: 1, description: 'รหัสเมนู' })
  menu_id: number;

  @ApiProperty({ example: 2, description: 'จำนวนรายการ' })
  quantity: number;

  @ApiProperty({ example: 40.0, description: 'ราคาต่อหน่วย' })
  unit_price: number;

  @ApiPropertyOptional({ example: 'เผ็ดกลาง', description: 'หมายเหตุเพิ่มเติมของรายการอาหาร' })
  notes?: string | null;

  @ApiPropertyOptional({ type: OrderItemMenuInfoDto, description: 'ข้อมูลเมนูอาหาร' })
  menu?: OrderItemMenuInfoDto;
}

export class ActiveOrderResponseDto {
  @ApiProperty({ example: 101, description: 'รหัสคำสั่งซื้อ' })
  order_id: number;

  @ApiPropertyOptional({ example: 4, description: 'รหัสลูกค้าผู้สั่ง' })
  user_id?: number | null;

  @ApiProperty({ example: 'DELIVERY', description: 'ประเภทคำสั่งซื้อ (DELIVERY / DINE_IN / TAKEAWAY)' })
  order_type: string;

  @ApiProperty({ example: 'IN_DELIVERY', description: 'สถานะคำสั่งซื้อ (PENDING, PAID, COOKING, READY, IN_DELIVERY, COMPLETED)' })
  status: string;

  @ApiProperty({ example: 120.0, description: 'ยอดรวมสุทธิ (บาท)' })
  total_price: number;

  @ApiPropertyOptional({ example: 80.0, description: 'ยอดค่าอาหารก่อนส่วนลดและค่าส่ง' })
  subtotal?: number;

  @ApiPropertyOptional({ example: 40.0, description: 'ค่าจัดส่ง' })
  delivery_fee?: number;

  @ApiPropertyOptional({ example: 0.0, description: 'ส่วนลด' })
  discount_amount?: number;

  @ApiPropertyOptional({ example: '123/45 ถนนพหลโยธิน แขวงลาดยาว เขตจตุจักร กทม.', description: 'ที่อยู่สำหรับจัดส่ง' })
  delivery_address?: string | null;

  @ApiPropertyOptional({ example: 'ตึกสีฟ้า หน้าเซเว่น ซอย 3', description: 'จุดสังเกตสำหรับการจัดส่ง (Landmark)' })
  delivery_landmark?: string | null;

  @ApiPropertyOptional({ example: '0891234567', description: 'เบอร์โทรศัพท์สำหรับจัดส่ง' })
  delivery_phone?: string | null;

  @ApiPropertyOptional({ example: 'ไม่ใส่ผักชี', description: 'หมายเหตุของคำสั่งซื้อ' })
  order_notes?: string | null;

  @ApiPropertyOptional({ example: 5, description: 'คะแนนรีวิว (1-5)' })
  rating?: number | null;

  @ApiPropertyOptional({ example: 'อาหารอร่อย ส่งไวมาก', description: 'ความคิดเห็นรีวิว' })
  review_comment?: string | null;

  @ApiProperty({ type: [OrderItemInfoDto], description: 'รายการอาหารในคำสั่งซื้อ' })
  order_items: OrderItemInfoDto[];

  @ApiPropertyOptional({
    type: DeliveryInfoDto,
    nullable: true,
    description: 'ข้อมูลการจัดส่งเดลิเวอรี่ พร้อมข้อมูลไรเดอร์ที่รับงาน',
  })
  delivery?: DeliveryInfoDto | null;

  @ApiPropertyOptional({
    type: RiderInfoDto,
    nullable: true,
    description: 'ข้อมูลไรเดอร์ที่รับงานจริง (เป็น null หากยังไม่มีไรเดอร์รับงาน)',
  })
  rider?: RiderInfoDto | null;

  @ApiProperty({ example: '2026-11-04T12:00:00.000Z', description: 'วันเวลาที่สร้างคำสั่งซื้อ' })
  created_at: Date;

  @ApiPropertyOptional({ example: '2026-11-04T12:20:00.000Z', description: 'วันเวลาที่อัปเดตล่าสุด' })
  updated_at?: Date;
}

