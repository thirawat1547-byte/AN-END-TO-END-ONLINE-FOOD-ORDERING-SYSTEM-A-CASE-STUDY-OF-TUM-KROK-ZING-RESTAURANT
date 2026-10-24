import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTableStatusDto {
  @ApiProperty({ 
    example: 'OCCUPIED', 
    description: 'สถานะโต๊ะ (AVAILABLE / OCCUPIED)' 
  })
  @IsString()
  @IsNotEmpty()
  status: string;
}