import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';

@ApiTags('Ingredients')
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Get()
  @ApiOperation({ summary: 'ดูรายการวัตถุดิบและจำนวนคงเหลือทั้งหมด' })
  findAll() {
    return this.ingredientsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดูรายละเอียดวัตถุดิบตาม ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ingredientsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'เพิ่มวัตถุดิบใหม่เข้าสต็อก' })
  create(@Body() createDto: CreateIngredientDto) {
    return this.ingredientsService.create(createDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'อัปเดตจำนวนสต็อกหรือข้อมูลวัตถุดิบ' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateIngredientDto,
  ) {
    return this.ingredientsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'ลบวัตถุดิบออกจากระบบ' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ingredientsService.remove(id);
  }
}