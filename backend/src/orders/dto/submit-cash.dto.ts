import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

export class SubmitCashDto {
  @ApiProperty({
    example: [1, 2, 3],
    description: 'รายการรหัสงานจัดส่ง (delivery_id) ที่ต้องการนำส่งเงินสด',
    type: [Number],
  })
  @IsArray({ message: 'delivery_ids ต้องเป็นอาร์เรย์ของตัวเลข' })
  @ArrayNotEmpty({ message: 'กรุณาเลือกรายการงานจัดส่งอย่างน้อย 1 รายการ' })
  @IsInt({ each: true, message: 'รหัสงานจัดส่งแต่ละตัวต้องเป็นตัวเลขจำนวนเต็ม' })
  delivery_ids: number[];
}

