import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'ดึงข้อมูลหมวดหมู่อาหารทั้งหมด (สำหรับลูกค้าและผู้ดูแลระบบ)' })
  @ApiResponse({ status: 200, description: 'ดึงรายการหมวดหมู่อาหารทั้งหมดสำเร็จ' })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดูรายละเอียดหมวดหมู่อาหารตาม ID' })
  @ApiParam({ name: 'id', description: 'รหัสหมวดหมู่อาหาร (category_id)', example: 1 })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลหมวดหมู่อาหารสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบหมวดหมู่อาหารตาม ID ที่ระบุ' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }
}

