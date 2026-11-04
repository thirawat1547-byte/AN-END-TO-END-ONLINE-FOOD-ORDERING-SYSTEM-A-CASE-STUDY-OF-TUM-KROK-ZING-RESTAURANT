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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderChatMessageDto } from './dto/chat-message.dto';
import { ReviewOrderDto } from './dto/review-order.dto';
import { ActiveOrderResponseDto } from './dto/active-order-response.dto';

import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  private getUserId(req: any): number {
    return Number(req.user?.user_id || req.user?.userId || req.user?.id || req.user?.sub);
  }

  private isAdmin(req: any): boolean {
    return String(req.user?.role || '').toUpperCase() === 'ADMIN';
  }

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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF', 'RIDER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ดูรายการคำสั่งซื้อทั้งหมด (ADMIN / STAFF / RIDER)' })
  @ApiQuery({ name: 'status', required: false, description: 'กรองตามสถานะ (PENDING, COOKING, READY, IN_DELIVERY, DELIVERED, COMPLETED)' })
  @ApiQuery({ name: 'tableId', required: false, type: Number, description: 'กรองตามหมายเลขโต๊ะ' })
  @ApiQuery({ name: 'orderType', required: false, description: 'กรองตามประเภท (DELIVERY, DINE_IN, TAKEAWAY)' })
  @ApiQuery({ name: 'date', required: false, description: 'กรองตามวันที่ (YYYY-MM-DD หรือ today)' })
  findAll(
    @Query('status') status?: string,
    @Query('tableId') tableId?: string,
    @Query('orderType') orderType?: string,
    @Query('date') date?: string,
  ) {
    return this.ordersService.findAll(
      status,
      tableId ? parseInt(tableId, 10) : undefined,
      orderType,
      date,
    );
  }

  // ดึงออเดอร์เดลิเวอรี่ที่กำลัง active อยู่ของ User ปัจจุบัน (สำหรับ Live Tracking)
  @Get('my-active')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ดูคำสั่งซื้อที่กำลังจัดส่งแบบเรียลไทม์ของผู้ใช้งานปัจจุบัน พร้อมข้อมูลไรเดอร์' })
  @ApiQuery({ name: 'orderId', required: false, description: 'รหัสคำสั่งซื้อที่ต้องการเจาะจง' })
  @ApiResponse({
    status: 200,
    description: 'ดึงข้อมูลคำสั่งซื้อที่กำลัง Active สำเร็จ พร้อมข้อมูลไรเดอร์ (หากยังไม่มีคนรับงาน rider จะเป็น null)',
    type: ActiveOrderResponseDto,
  })
  @ApiResponse({ status: 401, description: 'ไม่ได้เข้าสู่ระบบหรือไม่ได้รับอนุญาต (Unauthorized)' })
  findMyActiveOrder(@Req() req: any, @Query('orderId') orderId?: string): Promise<ActiveOrderResponseDto | null> {
    const rawUserId = req.user?.user_id || req.user?.userId || req.user?.id || req.user?.sub;
    const userId = Number(rawUserId);
    if (!userId || isNaN(userId) || userId <= 0) {
      return null;
    }
    return this.ordersService.findActiveUserOrder(userId, orderId ? parseInt(orderId, 10) : undefined) as any;
  }

  // ดึงประวัติเฉพาะของ User ปัจจุบัน (ต้องวางไว้ก่อน @Get(':id'))
  @Get('my-orders')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ดูประวัติคำสั่งซื้อของผู้ใช้งานปัจจุบัน' })
  findMyOrders(@Req() req: any) {
    const rawUserId = req.user?.user_id || req.user?.userId || req.user?.id || req.user?.sub;
    const userId = Number(rawUserId);
    if (!userId || isNaN(userId) || userId <= 0) {
      return [];
    }
    return this.ordersService.findByUser(userId);
  }

  // ดึงรายการออเดอร์เดลิเวอรี่สำหรับให้ไรเดอร์รับงาน
  @Get('deliveries/available')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF', 'RIDER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ดูรายการงานจัดส่งที่เปิดรับไรเดอร์ (ADMIN / STAFF / RIDER)' })
  getAvailableDeliveries() {
    return this.ordersService.getAvailableDeliveries();
  }

  // หน้าไรเดอร์: งานที่ครัวทำเสร็จพร้อมให้รับ, งานที่ฉันกำลังส่ง, ออเดอร์ที่ยังปรุงอยู่
  @Get('rider/jobs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF', 'RIDER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ดูงานจัดส่งสำหรับไรเดอร์ (ADMIN / STAFF / RIDER)' })
  getRiderJobs(@Req() req: any) {
    return this.ordersService.getRiderJobs(this.getUserId(req));
  }

  // ดูยอดรายได้สะสมของไรเดอร์
  @Get('rider/earnings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF', 'RIDER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ดูยอดรายได้ค่ารอบสะสมของไรเดอร์' })
  getRiderEarnings(@Req() req: any) {
    return this.ordersService.getRiderEarnings(this.getUserId(req));
  }

  // แอดมินดูรูปหลักฐานการจัดส่งและรีวิวจากลูกค้า (ต้องวางไว้ก่อน @Get(':id'))
  @Get('admin/feedback')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ดูรูปหลักฐานการจัดส่งและรีวิวจากลูกค้าทั้งหมด (Admin)' })
  getAdminFeedback() {
    return this.ordersService.getAdminFeedback();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ดูรายละเอียดคำสั่งซื้อตาม ID (ต้องเข้าสู่ระบบ)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  // ไรเดอร์กดรับงานจัดส่ง (จำกัดสิทธิ์เฉพาะ ADMIN, STAFF, RIDER)
  @Post(':id/claim-delivery')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF', 'RIDER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ไรเดอร์กดรับงานจัดส่งออเดอร์ (ADMIN / STAFF / RIDER)' })
  claimDelivery(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.ordersService.claimDelivery(id, this.getUserId(req));
  }

  // ไรเดอร์คืนงาน (ทำได้เฉพาะก่อนรับอาหารออกจากร้าน)
  @Post(':id/release-delivery')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF', 'RIDER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ไรเดอร์คืนงานจัดส่งที่รับไว้ (ADMIN / STAFF / RIDER)' })
  releaseDelivery(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.ordersService.releaseDelivery(id, this.getUserId(req), this.isAdmin(req));
  }

  // ไรเดอร์อัปเดตสถานะงานจัดส่ง (PICKED_UP, DELIVERED)
  @Patch(':id/delivery-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF', 'RIDER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ไรเดอร์อัปเดตสถานะการจัดส่ง (พร้อมแนบรูปถ่ายหลักฐาน) (ADMIN / STAFF / RIDER)' })
  updateDeliveryStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: string; proof_image_url?: string },
    @Req() req: any,
  ) {
    return this.ordersService.updateDeliveryStatus(id, this.getUserId(req), body.status, body.proof_image_url, this.isAdmin(req));
  }

  // ไรเดอร์อัปโหลดรูปหลักฐานการจัดส่ง -> เก็บไว้ที่ uploads/delivery-proofs แล้วส่ง URL กลับไปแนบตอน DELIVERED
  @Post(':id/delivery-proof')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF', 'RIDER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'อัปโหลดรูปถ่ายหลักฐานการจัดส่ง (ADMIN / STAFF / RIDER)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const proofDir = join(process.cwd(), 'uploads', 'delivery-proofs');
          if (!fs.existsSync(proofDir)) {
            fs.mkdirSync(proofDir, { recursive: true });
          }
          cb(null, proofDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname).toLowerCase() || '.jpg';
          cb(null, `order-${req.params.id}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|heic|heif)$/)) {
          return cb(new BadRequestException('รองรับเฉพาะไฟล์รูปภาพ (jpg, png, webp, heic) เท่านั้น'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )
  uploadDeliveryProof(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('กรุณาแนบรูปถ่ายหลักฐานการจัดส่ง');
    }
    return {
      success: true,
      order_id: id,
      url: `/uploads/delivery-proofs/${file.filename}`,
    };
  }

  // แชทระหว่างไรเดอร์และลูกค้า
  @Get(':id/chat')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ดูข้อความแชทของออเดอร์ (ไรเดอร์ <-> ลูกค้า)' })
  getChatMessages(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const rawUserId = req.user?.user_id || req.user?.userId || req.user?.id || req.user?.sub;
    const role = String(req.user?.role || '').toLowerCase();
    const isCustomer = rawUserId && (!role || role === 'customer');
    return this.ordersService.getChatMessages(id, isCustomer ? Number(rawUserId) : undefined);
  }

  @Post(':id/chat')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ส่งข้อความแชทในออเดอร์ (ไรเดอร์ <-> ลูกค้า)' })
  sendChatMessage(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: OrderChatMessageDto,
    @Req() req: any,
  ) {
    const rawUserId = req.user?.user_id || req.user?.userId || req.user?.id || req.user?.sub;
    return this.ordersService.sendChatMessage(id, body.sender, body.message, rawUserId ? Number(rawUserId) : undefined);
  }

  // ลูกค้าให้คะแนนรีวิวออเดอร์
  @Post(':id/review')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ลูกค้าให้คะแนนและรีวิวออเดอร์ที่ได้รับแล้ว' })
  reviewOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ReviewOrderDto,
    @Req() req: any,
  ) {
    const rawUserId = req.user?.user_id || req.user?.userId || req.user?.id || req.user?.sub;
    return this.ordersService.reviewOrder(id, Number(rawUserId), body);
  }

  // เปลี่ยนสถานะคำสั่งซื้อ (ป้องกันไม่ให้ใครก็ได้มายิงเปลี่ยนสถานะ: อนุญาตเฉพาะ ADMIN, STAFF, RIDER)
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF', 'RIDER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'เปลี่ยนสถานะคำสั่งซื้อ (ADMIN / STAFF / RIDER)' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto);
  }
}