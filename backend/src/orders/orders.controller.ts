// src/orders/orders.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'สร้างคำสั่งซื้อใหม่ (Order)' })
  @ApiResponse({ status: 201, description: 'สร้างคำสั่งซื้อสำเร็จ' })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'ดูรายการคำสั่งซื้อทั้งหมด' })
  @ApiQuery({ name: 'status', required: false, description: 'กรองตามสถานะ (PENDING, COOKING, READY, COMPLETED)' })
  @ApiQuery({ name: 'tableId', required: false, type: Number, description: 'กรองตามหมายเลขโต๊ะ' })
  findAll(
    @Query('status') status?: string,
    @Query('tableId') tableId?: string,
  ) {
    return this.ordersService.findAll(
      status,
      tableId ? parseInt(tableId, 10) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดูรายละเอียดคำสั่งซื้อตาม ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'เปลี่ยนสถานะคำสั่งซื้อ' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto);
  }
}