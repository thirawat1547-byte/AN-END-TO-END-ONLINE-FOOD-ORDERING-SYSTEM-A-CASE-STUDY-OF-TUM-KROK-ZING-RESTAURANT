import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';

export class SocialLoginDto {
  @ApiProperty({
    example: 'google',
    description: 'แพลตฟอร์ม Social (google, facebook, line)',
    enum: ['google', 'facebook', 'line'],
  })
  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุ Social Provider' })
  @IsIn(['google', 'facebook', 'line'], { message: 'Provider ต้องเป็น google, facebook หรือ line เท่านั้น' })
  provider: 'google' | 'facebook' | 'line';

  @ApiPropertyOptional({ example: '1029384756', description: 'User ID จากทาง Social Provider' })
  @IsOptional()
  @IsString()
  providerId?: string;

  @ApiPropertyOptional({ example: 'user@example.com', description: 'อีเมลของผู้ใช้งาน' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: 'สมชาย ลูกค้าประจำ', description: 'ชื่อผู้ใช้งาน' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg', description: 'รูปโปรไฟล์' })
  @IsOptional()
  @IsString()
  avatar?: string;
}
