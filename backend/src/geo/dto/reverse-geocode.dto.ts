import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class ReverseGeocodeDto {
  @ApiProperty({
    example: 13.87613,
    description: 'ละติจูด (Latitude) เช่น 13.87613',
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'lat ต้องเป็นตัวเลข' })
  @IsNotEmpty({ message: 'กรุณาระบุ lat' })
  lat: number;

  @ApiProperty({
    example: 100.59630,
    description: 'ลองจิจูด (Longitude) เช่น 100.59630',
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'lng ต้องเป็นตัวเลข' })
  @IsNotEmpty({ message: 'กรุณาระบุ lng' })
  lng: number;
}

