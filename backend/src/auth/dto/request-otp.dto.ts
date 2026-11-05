import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class RequestOtpDto {
  @ApiProperty({
    example: '0812345678',
    description: 'เบอร์โทรศัพท์มือถือ 10 หลัก (ขึ้นต้นด้วย 0)',
  })
  @IsString({ message: 'เบอร์โทรศัพท์ต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'กรุณากรอกเบอร์โทรศัพท์' })
  @Matches(/^0\d{9}$/, {
    message: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลักและขึ้นต้นด้วย 0',
  })
  phone: string;
}

