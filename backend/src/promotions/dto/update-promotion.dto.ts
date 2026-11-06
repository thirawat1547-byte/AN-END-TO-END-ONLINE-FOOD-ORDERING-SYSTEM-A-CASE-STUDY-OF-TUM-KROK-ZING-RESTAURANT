import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';
import { CreatePromotionDto } from './create-promotion.dto';

export class UpdatePromotionDto extends PartialType(CreatePromotionDto) {
  // วันเริ่มแก้ได้ตอนแก้ไขเท่านั้น (ตอนสร้างระบบล็อกเป็นวันนี้)
  @ApiProperty({ example: '2026-11-10', description: 'วันเริ่มใช้โค้ด', required: false })
  @IsDateString()
  @IsOptional()
  start_date?: string;
}
