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
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'สร้างคำสั่งซื้อใหม่ (Order) - รองรับทั้งสั่งออนไลน์และสั่งที่โต๊ะ' })
  @ApiResponse({ status: 201, description: 'สร้างคำสั่งซื้อสำเร็จ' })
  create(@Body() createOrderDto: CreateOrderDto, @Req() req: any) {
    const userId = req.user?.user_id || req.user?.userId || req.user?.id || req.user?.sub;
    if (userId) {
      createOrderDto.user_id = Number(userId);
    }

    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'ดูรายการคำสั่งซื้อทั้งหมด' })
  @ApiQuery({ name: 'status', required: false, description: 'กรองตามสถานะ (PENDING, COOKING, READY, IN_DELIVERY, DELIVERED, COMPLETED)' })
  @ApiQuery({ name: 'tableId', required: false, type: Number, description: 'กรองตามหมายเลขโต๊ะ' })
  @ApiQuery({ name: 'orderType', required: false, description: 'กรองตามประเภท (DELIVERY, DINE_IN, TAKEAWAY)' })
  findAll(
    @Query('status') status?: string,
    @Query('tableId') tableId?: string,
    @Query('orderType') orderType?: string,
  ) {
    return this.ordersService.findAll(
      status,
      tableId ? parseInt(tableId, 10) : undefined,
      orderType,
    );
  }

  // ดึงประวัติเฉพาะของ User ปัจจุบัน (ต้องวางไว้ก่อน @Get(':id'))
  @Get('my-orders')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ดูประวัติคำสั่งซื้อของผู้ใช้งานปัจจุบัน' })
  findMyOrders(@Req() req: any) {
    const userId = req.user?.user_id || req.user?.userId || req.user?.id || req.user?.sub;
    return this.ordersService.findByUser(Number(userId));
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