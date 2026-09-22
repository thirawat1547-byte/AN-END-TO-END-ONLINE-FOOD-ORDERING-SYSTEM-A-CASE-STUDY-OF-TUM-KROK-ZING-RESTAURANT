// src/auth/dto/register.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'somchai_k', description: 'ชื่อผู้ใช้งาน (Username)' })
  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอก Username' })
  username: string;

  @ApiProperty({ example: 'password1234', description: 'รหัสผ่านอย่างน้อย 4 ตัวอักษร' })
  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่าน' })
  @MinLength(4, { message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร' })
  password: string;

  @ApiPropertyOptional({ example: 'somchai@example.com', description: 'อีเมลผู้ใช้งาน' })
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '0812345678', description: 'เบอร์โทรศัพท์' })
  @IsString()
  @IsOptional()
  phone_number?: string;

<<<<<<< HEAD
  @ApiPropertyOptional({ example: '99 ซ.ศูนย์วิจัย 7 ถ.เพชรบุรีตัดใหม่ แขวงบางกะปิ เขตห้วยขวาง กรุงเทพมหานคร 10310', description: 'ที่อยู่' })
  @IsString()
  @IsOptional()
  address?: string;

=======
>>>>>>> ef88a7f3e8d3f2bbf12b66b2459f49965c365656
  @ApiPropertyOptional({ example: 'CUSTOMER', description: 'สิทธิ์ผู้ใช้งาน (ADMIN, CASHIER, CUSTOMER)' })
  @IsString()
  @IsOptional()
  role?: string;
}