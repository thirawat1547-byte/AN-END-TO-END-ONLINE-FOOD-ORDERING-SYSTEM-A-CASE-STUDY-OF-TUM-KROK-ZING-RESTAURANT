import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({
    example: '0812345678',
    description: 'เบอร์โทรศัพท์มือถือ 10 หลักที่ขอ OTP',
  })
  @IsString({ message: 'เบอร์โทรศัพท์ต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'กรุณากรอกเบอร์โทรศัพท์' })
  @Matches(/^0\d{9}$/, {
    message: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลักและขึ้นต้นด้วย 0',
  })
  phone: string;

  @ApiProperty({
    example: '123456',
    description: 'รหัส OTP 6 หลักที่ได้รับ',
  })
  @IsString({ message: 'รหัส OTP ต้องเป็นข้อความ' })
  @IsNotEmpty({ message: 'กรุณากรอกรหัส OTP' })
  @Length(6, 6, { message: 'รหัส OTP ต้องมีความยาว 6 หลัก' })
  otp: string;
}

