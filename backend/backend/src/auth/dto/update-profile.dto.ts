import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: '0812345678', required: false })
  @IsString()
  @IsOptional()
  phone_number?: string;

  @ApiProperty({ example: '123/45 ถนนแจ้งวัฒนะ ปากเกร็ด นนทบุรี', required: false })
  @IsString()
  @IsOptional()
  address?: string;
}