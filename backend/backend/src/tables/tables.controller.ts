import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableStatusDto } from './dto/update-table-status.dto';

// src/tables/tables.controller.ts
@ApiTags('Tables') 
@Controller('tables')
export class TablesController {
  // ... โค้ดเดิม
  constructor(private readonly tablesService: TablesService) {}

  @Get()
  @ApiOperation({ summary: 'ดูรายการโต๊ะอาหารทั้งหมด' })
  findAll() {
    return this.tablesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดูรายละเอียดโต๊ะรายตัวตาม ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tablesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'เพิ่มโต๊ะอาหารใหม่' })
  create(@Body() createTableDto: CreateTableDto) {
    return this.tablesService.create(createTableDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'อัปเดตสถานะโต๊ะ (AVAILABLE / OCCUPIED)' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTableStatusDto,
  ) {
    return this.tablesService.updateStatus(id, updateDto);
  }
}