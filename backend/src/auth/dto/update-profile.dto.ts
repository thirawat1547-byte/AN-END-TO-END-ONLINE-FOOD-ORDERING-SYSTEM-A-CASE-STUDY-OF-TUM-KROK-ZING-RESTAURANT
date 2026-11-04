import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: '0812345678', required: false })
  @IsString()
  @IsOptional()
  phone_number?: string;

  @ApiProperty({ example: '123/45 ถนนแจ้งวัฒนะ ปากเกร็ด นนทบุรี', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'user@example.com', required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false, description: 'ลิงก์รูปโปรไฟล์ (ส่งค่าว่างเพื่อลบรูป)' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  avatar_url?: string;
}