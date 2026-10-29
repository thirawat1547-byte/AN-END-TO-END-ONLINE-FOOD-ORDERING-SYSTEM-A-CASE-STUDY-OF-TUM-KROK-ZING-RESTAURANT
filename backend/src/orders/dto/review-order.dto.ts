// src/orders/dto/review-order.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class ReviewOrderDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5, description: 'คะแนนรีวิว 1-5 ดาว' })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'อร่อยมาก ส่งไว', required: false, description: 'ความคิดเห็นเพิ่มเติม' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  comment?: string;
}
