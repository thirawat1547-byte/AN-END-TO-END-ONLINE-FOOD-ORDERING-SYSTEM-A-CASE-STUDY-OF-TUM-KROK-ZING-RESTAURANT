import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@ApiTags('Menu Management')
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
  @ApiOperation({ summary: 'เพิ่มเมนูอาหารใหม่' })
  @ApiResponse({ status: 201, description: 'สร้างเมนูอาหารสำเร็จ' })
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menusService.create(createMenuDto);
  }

  @Get()
  @ApiOperation({
    summary: 'ดึงรายการอาหารทั้งหมด (กรองตามหมวดหมู่/สถานะขายได้)',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: Number,
    description: 'รหัสหมวดหมู่ที่ต้องการกรอง',
  })
  @ApiQuery({
    name: 'isAvailable',
    required: false,
    type: Boolean,
    description: 'กรองเฉพาะรายการที่พร้อมขาย (true/false)',
  })
  findAll(
    @Query('categoryId') categoryId?: string,
    @Query('isAvailable') isAvailable?: string,
  ) {
    const parsedCatId =
      categoryId && !isNaN(Number(categoryId))
        ? parseInt(categoryId, 10)
        : undefined;

    const parsedAvailable =
      isAvailable !== undefined && isAvailable !== ''
        ? isAvailable === 'true'
        : undefined;

    return this.menusService.findAll(parsedCatId, parsedAvailable);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดูรายละเอียดเมนูอาหารตามรหัส (ID)' })
  @ApiParam({ name: 'id', description: 'รหัสเมนูอาหาร (menu_id)' })
  @ApiResponse({ status: 200, description: 'พบข้อมูลเมนู' })
  @ApiResponse({ status: 404, description: 'ไม่พบเมนูอาหาร' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menusService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'แก้ไขข้อมูลเมนูอาหาร' })
  @ApiParam({ name: 'id', description: 'รหัสเมนูอาหาร (menu_id)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMenuDto: UpdateMenuDto,
  ) {
    return this.menusService.update(id, updateMenuDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'ลบเมนูอาหารออกจากระบบ' })
  @ApiParam({ name: 'id', description: 'รหัสเมนูอาหาร (menu_id)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.menusService.remove(id);
  }
}