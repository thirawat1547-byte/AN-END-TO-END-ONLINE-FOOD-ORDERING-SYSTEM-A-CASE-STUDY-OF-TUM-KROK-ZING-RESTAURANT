import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

// ต้องมี decorator ทุกฟิลด์ เพราะ ValidationPipe ตั้ง whitelist + forbidNonWhitelisted
// (ถ้าไม่มี ระบบจะปฏิเสธทุกฟิลด์ และหน้าตั้งค่าร้านบันทึกไม่ได้)
export class UpdateSettingsDto {
  @IsOptional() @IsString() @MaxLength(150) store_name?: string;
  @IsOptional() @IsString() @MaxLength(255) tagline?: string;
  @IsOptional() @IsString() @MaxLength(20) promptpay_number?: string;
  @IsOptional() @IsString() @MaxLength(150) promptpay_name?: string;
  @IsOptional() @IsString() @MaxLength(50) tax_id?: string;
  @IsOptional() @IsString() @MaxLength(255) address?: string;
  @IsOptional() @IsString() @MaxLength(30) phone?: string;
  @IsOptional() @IsString() @MaxLength(10) open_time?: string;
  @IsOptional() @IsString() @MaxLength(10) close_time?: string;
  @IsOptional() @IsBoolean() is_open?: boolean;
  @IsOptional() @IsNumber() @Min(0) base_delivery_fee?: number;
  @IsOptional() @IsNumber() @Min(0) delivery_fee_per_km?: number;
  @IsOptional() @IsNumber() @Min(0) max_delivery_km?: number;
  @IsOptional() @IsNumber() @Min(0) min_order_delivery?: number;
  @IsOptional() @IsNumber() @Min(0) base_rider_fee?: number;
  // หน้าแอดมินส่งฟิลด์นี้มาด้วย แต่ยังไม่ได้โหลดค่าจริงจากเซิร์ฟเวอร์ จึงรับไว้เฉย ๆ ไม่บันทึก
  // (กันค่าเริ่มต้นฝั่งหน้าเว็บ 25 บาท ไปทับค่าจริง base_rider_fee ในฐานข้อมูล)
  @IsOptional() @IsNumber() @Min(0) rider_fee?: number;
  @IsOptional() @IsNumber() @Min(0) vat_rate?: number;
}
