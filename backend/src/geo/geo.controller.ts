import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GeoService } from './geo.service';
import { ReverseGeocodeDto } from './dto/reverse-geocode.dto';
import { SearchAddressDto } from './dto/search-address.dto';
import {
  ReverseGeocodeResponseDto,
  SearchAddressItemDto,
} from './dto/geo-response.dto';

@ApiTags('Geo & Address (OpenStreetMap)')
@Controller('geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Get('reverse')
  @ApiOperation({
    summary: 'แปลงพิกัดละติจูด/ลองจิจูดเป็นที่อยู่ (Reverse Geocoding Proxy)',
    description:
      'เรียก OpenStreetMap Nominatim เพื่อแปลงพิกัด GPS เป็นที่อยู่ภาษาไทย พร้อม In-memory Cache (~10m) และ Rate Limiting ไม่เกิน 1 req/sec',
  })
  @ApiResponse({
    status: 200,
    description: 'แปลงพิกัดเป็นที่อยู่สำเร็จ',
    type: ReverseGeocodeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'พิกัดไม่ถูกต้องหรือไม่ครบถ้วน' })
  @ApiResponse({ status: 404, description: 'ไม่พบที่อยู่ตามพิกัดที่ระบุ' })
  @ApiResponse({ status: 502, description: 'เชื่อมต่อ OpenStreetMap Nominatim ไม่สำเร็จ' })
  reverseGeocode(@Query() dto: ReverseGeocodeDto) {
    return this.geoService.reverseGeocode(dto.lat, dto.lng);
  }

  @Get('search')
  @ApiOperation({
    summary: 'ค้นหาที่อยู่หรือสถานที่ด้วยข้อความ (Address Search Proxy)',
    description:
      'ค้นหาพิกัดและที่อยู่ภาษาไทยในประเทศไทยผ่าน OpenStreetMap Nominatim พร้อม In-memory Cache และ Rate Limiting ไม่เกิน 1 req/sec',
  })
  @ApiResponse({
    status: 200,
    description: 'ค้นหาที่อยู่สำเร็จ คืนรายการพิกัดและชื่อสถานที่',
    type: [SearchAddressItemDto],
  })
  @ApiResponse({ status: 400, description: 'ไม่ได้ระบุคำค้นหา q' })
  @ApiResponse({ status: 502, description: 'เชื่อมต่อ OpenStreetMap Nominatim ไม่สำเร็จ' })
  searchAddress(@Query() dto: SearchAddressDto) {
    return this.geoService.searchAddress(dto.q);
  }
}

