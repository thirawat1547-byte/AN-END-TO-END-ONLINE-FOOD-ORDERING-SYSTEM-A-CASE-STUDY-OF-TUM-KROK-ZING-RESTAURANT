import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Ingredients')
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Get()
  @ApiOperation({ summary: 'ดูรายการวัตถุดิบและจำนวนคงเหลือทั้งหมด' })
  findAll() {
    return this.ingredientsService.findAll();
  }

  @Post('translate-thai')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'แปลงชื่อและหน่วยวัตถุดิบทั้งหมดในฐานข้อมูลเป็นภาษาไทย (เฉพาะ Admin)' })
  translateAllToThai() {
    return this.ingredientsService.translateAllToThai();
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดูรายละเอียดวัตถุดิบตาม ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ingredientsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'เพิ่มวัตถุดิบใหม่เข้าสต็อก (เฉพาะ Admin)' })
  create(@Body() createDto: CreateIngredientDto) {
    return this.ingredientsService.create(createDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'อัปเดตจำนวนสต็อกหรือข้อมูลวัตถุดิบ (เฉพาะ Admin)' })
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
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ingredientsService.remove(id);
  }
}