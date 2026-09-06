// src/orders/dto/update-order-status.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({
    example: 'COOKING',
    enum: ['PENDING', 'COOKING', 'READY', 'COMPLETED', 'CANCELLED'],
    description: 'สถานะใหม่ของออร์เดอร์',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['PENDING', 'COOKING', 'READY', 'COMPLETED', 'CANCELLED'])
  status: string;
}