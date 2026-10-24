import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateIngredientDto } from './create-ingredient.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateIngredientDto extends PartialType(CreateIngredientDto) {
  @ApiProperty({ example: 5, description: 'ปรับเพิ่ม/ลดจำนวนสต็อก', required: false })
  @IsNumber()
  @IsOptional()
  quantity?: number;
}