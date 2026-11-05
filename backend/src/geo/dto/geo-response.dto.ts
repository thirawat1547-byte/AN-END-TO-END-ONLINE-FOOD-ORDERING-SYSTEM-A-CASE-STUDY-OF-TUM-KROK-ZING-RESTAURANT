import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddressDetailsDto {
  @ApiPropertyOptional({ example: '123/45', description: 'บ้านเลขที่ / อาคาร' })
  house_number: string;

  @ApiPropertyOptional({ example: 'ซอยแจ้งวัฒนะ 14', description: 'ถนน / ซอย' })
  road: string;

  @ApiPropertyOptional({ example: 'ทุ่งสองห้อง', description: 'ตำบล / แขวง' })
  subdistrict: string;

  @ApiPropertyOptional({ example: 'เขตหลักสี่', description: 'อำเภอ / เขต' })
  district: string;

  @ApiPropertyOptional({ example: 'กรุงเทพมหานคร', description: 'จังหวัด' })
  province: string;

  @ApiPropertyOptional({ example: '10210', description: 'รหัสไปรษณีย์' })
  postcode: string;
}

export class ReverseGeocodeResponseDto {
  @ApiProperty({ example: 13.87613, description: 'ละติจูด (Latitude)' })
  lat: number;

  @ApiProperty({ example: 100.59630, description: 'ลองจิจูด (Longitude)' })
  lng: number;

  @ApiProperty({
    example: 'ร้านตำครกซิ่ง, ซอยแจ้งวัฒนะ 14, ทุ่งสองห้อง, เขตหลักสี่, กรุงเทพมหานคร, 10210, ประเทศไทย',
    description: 'ที่อยู่ภาษาไทยเต็มรูปแบบ',
  })
  display_name: string;

  @ApiProperty({ type: AddressDetailsDto, description: 'ข้อมูลที่อยู่แยกตามประเภท' })
  address: AddressDetailsDto;
}

export class SearchAddressItemDto {
  @ApiPropertyOptional({ example: 12345678, description: 'ID สถานที่จาก OSM' })
  place_id?: number | string;

  @ApiProperty({
    example: 'ซอยแจ้งวัฒนะ 14, ทุ่งสองห้อง, เขตหลักสี่, กรุงเทพมหานคร, 10210, ประเทศไทย',
    description: 'ชื่อสถานที่และที่อยู่เต็มภาษาไทย',
  })
  display_name: string;

  @ApiProperty({ example: 13.87613, description: 'ละติจูด (Latitude)' })
  lat: number;

  @ApiProperty({ example: 100.59630, description: 'ลองจิจูด (Longitude)' })
  lng: number;

  @ApiPropertyOptional({ type: AddressDetailsDto, description: 'ข้อมูลที่อยู่แยกส่วน (ถ้ามี)' })
  address?: AddressDetailsDto;
}

