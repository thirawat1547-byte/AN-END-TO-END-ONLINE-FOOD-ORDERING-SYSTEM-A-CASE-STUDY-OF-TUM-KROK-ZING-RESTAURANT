import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTableDto {
  @ApiProperty({ example: 'T-02', description: 'หมายเลขโต๊ะ' })
  @IsString()
  @IsNotEmpty()
  table_number: string;

  @ApiProperty({ example: 4, description: 'จำนวนที่นั่ง' })
  @IsNumber()
  @IsNotEmpty()
  capacity: number;
}