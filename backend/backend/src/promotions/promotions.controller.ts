import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@ApiTags('Promotions')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get()
  @ApiOperation({ summary: 'ดูรายการโปรโมชันทั้งหมด (Admin/Staff)' })
  findAll() {
    return this.promotionsService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'ดูรายการโปรโมชันที่กำลังเปิดใช้งานอยู่ (สำหรับลูกค้า)' })
  findActive() {
    return this.promotionsService.findActive();
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'ตรวจสอบและดึงรายละเอียดโปรโมชันตามรหัสโค้ดส่วนลด' })
  findByCode(@Param('code') code: string) {
    return this.promotionsService.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดูรายละเอียดโปรโมชันตาม ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.promotionsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'สร้างโปรโมชัน/โค้ดส่วนลดใหม่' })
  create(@Body() createDto: CreatePromotionDto) {
    return this.promotionsService.create(createDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'แก้ไขข้อมูลโปรโมชัน หรือเปิด/ปิดการใช้งาน' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePromotionDto,
  ) {
    return this.promotionsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'ลบโปรโมชันออกจากระบบ' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.promotionsService.remove(id);
  }
}