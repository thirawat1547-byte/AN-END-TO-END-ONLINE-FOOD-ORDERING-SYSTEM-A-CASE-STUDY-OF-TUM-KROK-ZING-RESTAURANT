import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { CreateIngredientPurchaseDto } from './dto/create-ingredient-purchase.dto';
import { QueryIngredientPurchasesDto } from './dto/query-ingredient-purchases.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Ingredients')
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Get()
  @ApiOperation({ summary: 'ดูรายการวัตถุดิบและจำนวนคงเหลือทั้งหมด' })
  @ApiResponse({ status: 200, description: 'ดึงรายการวัตถุดิบทั้งหมดสำเร็จ' })
  findAll() {
    return this.ingredientsService.findAll();
  }

  @Post('translate-thai')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'แปลงชื่อและหน่วยวัตถุดิบทั้งหมดในฐานข้อมูลเป็นภาษาไทย (เฉพาะ Admin)' })
  @ApiResponse({ status: 200, description: 'แปลงชื่อและหน่วยวัตถุดิบเป็นภาษาไทยสำเร็จ' })
  translateAllToThai() {
    return this.ingredientsService.translateAllToThai();
  }

  @Get('purchases')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'KITCHEN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ดึงประวัติการซื้อวัตถุดิบตามช่วงเวลา (เฉพาะ Admin และ Kitchen)' })
  @ApiQuery({ name: 'from', required: false, type: String, description: 'วันที่เริ่มต้น เช่น 2026-11-01 หรือ ISO 8601' })
  @ApiQuery({ name: 'to', required: false, type: String, description: 'วันที่สิ้นสุด เช่น 2026-11-30 หรือ ISO 8601' })
  @ApiResponse({ status: 200, description: 'ดึงรายการประวัติการซื้อวัตถุดิบสำเร็จ' })
  @ApiResponse({ status: 401, description: 'ไม่ได้เข้าสู่ระบบ (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์เข้าถึง (Forbidden)' })
  findAllPurchases(@Query() query: QueryIngredientPurchasesDto) {
    return this.ingredientsService.findAllPurchases(query);
  }

  @Post(':id/purchases')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'KITCHEN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'บันทึกการสั่งซื้อวัตถุดิบเข้าคลังพร้อมเพิ่มสต็อกทันที (เฉพาะ Admin และ Kitchen)' })
  @ApiParam({ name: 'id', type: Number, description: 'รหัสวัตถุดิบ (ingredient_id)' })
  @ApiResponse({ status: 201, description: 'บันทึกการซื้อวัตถุดิบและเพิ่มจำนวนสต็อกสำเร็จ' })
  @ApiResponse({ status: 400, description: 'ข้อมูลที่ส่งมาไม่ถูกต้อง (Bad Request)' })
  @ApiResponse({ status: 401, description: 'ไม่ได้เข้าสู่ระบบ (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์เข้าถึง (Forbidden)' })
  @ApiResponse({ status: 404, description: 'ไม่พบวัตถุดิบรหัสที่ระบุ (Not Found)' })
  createPurchase(
    @Param('id', ParseIntPipe) id: number,
    @Body() createPurchaseDto: CreateIngredientPurchaseDto,
    @CurrentUser() user: any,
  ) {
    const userId = user?.userId || user?.sub || user?.user_id;
    return this.ingredientsService.createPurchase(id, createPurchaseDto, Number(userId));
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดูรายละเอียดวัตถุดิบตาม ID' })
  @ApiParam({ name: 'id', type: Number, description: 'รหัสวัตถุดิบ (ingredient_id)' })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลวัตถุดิบสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบวัตถุดิบรหัสที่ระบุ (Not Found)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ingredientsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'เพิ่มวัตถุดิบใหม่เข้าสต็อก (เฉพาะ Admin)' })
  @ApiResponse({ status: 201, description: 'เพิ่มวัตถุดิบใหม่สำเร็จ' })
  @ApiResponse({ status: 401, description: 'ไม่ได้เข้าสู่ระบบ (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์เข้าถึง (Forbidden)' })
  create(@Body() createDto: CreateIngredientDto) {
    return this.ingredientsService.create(createDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'อัปเดตจำนวนสต็อกหรือข้อมูลวัตถุดิบ (เฉพาะ Admin)' })
  @ApiParam({ name: 'id', type: Number, description: 'รหัสวัตถุดิบ (ingredient_id)' })
  @ApiResponse({ status: 200, description: 'อัปเดตข้อมูลวัตถุดิบสำเร็จ' })
  @ApiResponse({ status: 401, description: 'ไม่ได้เข้าสู่ระบบ (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์เข้าถึง (Forbidden)' })
  @ApiResponse({ status: 404, description: 'ไม่พบวัตถุดิบรหัสที่ระบุ (Not Found)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateIngredientDto,
  ) {
    return this.ingredientsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ลบวัตถุดิบออกจากระบบ (เฉพาะ Admin)' })
  @ApiParam({ name: 'id', type: Number, description: 'รหัสวัตถุดิบ (ingredient_id)' })
  @ApiResponse({ status: 200, description: 'ลบวัตถุดิบสำเร็จ' })
  @ApiResponse({ status: 401, description: 'ไม่ได้เข้าสู่ระบบ (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์เข้าถึง (Forbidden)' })
  @ApiResponse({ status: 404, description: 'ไม่พบวัตถุดิบรหัสที่ระบุ (Not Found)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ingredientsService.remove(id);
  }
}
