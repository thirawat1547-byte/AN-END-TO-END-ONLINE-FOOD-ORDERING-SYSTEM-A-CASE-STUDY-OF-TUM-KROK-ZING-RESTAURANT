import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

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

  @Get('my/list')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'ดูรายการคูปองโปรโมชันที่ User คนนี้กดเก็บไว้' })
  getMyPromotions(@CurrentUser() user: any) {
    const userId = user.userId || user.sub || user.user_id;
    return this.promotionsService.getMyPromotions(Number(userId));
  }

  @Post('claim/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'กดเก็บโค้ดส่วนลดเข้ากระเป๋าของ User ปัจจุบัน' })
  claimPromotion(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    const userId = user.userId || user.sub || user.user_id;
    return this.promotionsService.claimPromotion(Number(userId), id);
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