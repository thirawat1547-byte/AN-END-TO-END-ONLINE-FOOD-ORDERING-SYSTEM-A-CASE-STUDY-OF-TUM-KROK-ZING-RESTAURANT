import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@ApiTags('Menus')
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post('upload')
  @ApiOperation({ summary: 'อัปโหลดไฟล์ภาพเมนูอาหารตรง (Multer)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadsDir = join(process.cwd(), 'uploads');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          cb(null, uploadsDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `menu-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(
            new BadRequestException('รองรับเฉพาะไฟล์รูปภาพ (jpg, jpeg, png, gif, webp) เท่านั้น'),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('กรุณาเลือกไฟล์ภาพที่ต้องการอัปโหลด');
    }
    const fileUrl = `/uploads/${file.filename}`;
    return {
      success: true,
      url: fileUrl,
      filename: file.filename,
      size: file.size,
    };
  }

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

  @Put(':id/ingredients')
  @ApiOperation({ summary: 'ผูกสูตรอาหาร / ปรับปรุงสัดส่วนวัตถุดิบ (Recipe Formulation)' })
  @ApiParam({ name: 'id', description: 'รหัสเมนูอาหาร (menu_id)' })
  updateIngredients(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { ingredients: Array<{ ingredient_id: number; quantity_used: number }> },
  ) {
    return this.menusService.updateIngredients(id, body.ingredients || []);
  }

  @Post(':id/ingredients')
  @ApiOperation({ summary: 'ผูกสูตรอาหาร / ปรับปรุงสัดส่วนวัตถุดิบ (Recipe Formulation)' })
  @ApiParam({ name: 'id', description: 'รหัสเมนูอาหาร (menu_id)' })
  saveIngredients(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { ingredients: Array<{ ingredient_id: number; quantity_used: number }> },
  ) {
    return this.menusService.updateIngredients(id, body.ingredients || []);
  }
}