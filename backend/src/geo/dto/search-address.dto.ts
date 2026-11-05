import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SearchAddressDto {
  @ApiProperty({
    example: 'แจ้งวัฒนะ 14',
    description: 'คำค้นหาที่อยู่หรือชื่อสถานที่ในประเทศไทย',
  })
  @IsString({ message: 'q ต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'กรุณาระบุคำค้นหา q' })
  q: string;
}

