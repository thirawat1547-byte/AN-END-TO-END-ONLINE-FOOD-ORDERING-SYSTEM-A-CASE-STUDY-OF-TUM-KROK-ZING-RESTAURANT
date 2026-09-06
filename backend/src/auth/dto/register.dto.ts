// src/auth/dto/register.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'somchai_k', description: 'ชื่อผู้ใช้งาน (Username)' })
  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอก Username' })
  username: string;

  @ApiProperty({ example: 'password1234', description: 'รหัสผ่านอย่างน้อย 6 ตัวอักษร' })
  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่าน' })
  @MinLength(6, { message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' })
  password: string;

  @ApiPropertyOptional({ example: 'somchai@example.com', description: 'อีเมลผู้ใช้งาน' })
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '0812345678', description: 'เบอร์โทรศัพท์' })
  @IsString()
  @IsOptional()
  phone_number?: string;

  @ApiPropertyOptional({ example: 'CUSTOMER', description: 'สิทธิ์ผู้ใช้งาน (ADMIN, CASHIER, CUSTOMER)' })
  @IsString()
  @IsOptional()
  role?: string;
}