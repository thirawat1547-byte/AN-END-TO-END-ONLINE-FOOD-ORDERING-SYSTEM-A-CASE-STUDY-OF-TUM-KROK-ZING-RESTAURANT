import {
  Controller,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { SubmitCashDto } from './dto/submit-cash.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Deliveries & Rider Cash')
@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly ordersService: OrdersService) {}

  @Patch('cash/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RIDER', 'ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ไรเดอร์ส่งเงินสดเข้าสู่ระบบ (รอยืนยัน) (เฉพาะ Rider)' })
  @ApiResponse({ status: 200, description: 'นำส่งเงินสดสำเร็จ' })
  @ApiResponse({ status: 400, description: 'ข้อมูลไม่ถูกต้อง หรือสถานะไม่อยู่ในเงื่อนไข' })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์นำส่งงานของผู้อื่น' })
  @ApiResponse({ status: 404, description: 'ไม่พบงานจัดส่ง' })
  submitCash(@Body() dto: SubmitCashDto, @CurrentUser() user: any) {
    const riderId = Number(user?.userId || user?.sub || user?.user_id);
    return this.ordersService.submitCash(dto.delivery_ids, riderId);
  }

  @Patch(':id/cash/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'แอดมินยืนยันรับเงินสดจากไรเดอร์ (เฉพาะ Admin)' })
  @ApiParam({ name: 'id', type: Number, description: 'รหัสงานจัดส่ง (delivery_id)' })
  @ApiResponse({ status: 200, description: 'ยืนยันรับเงินสดสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบงานจัดส่ง' })
  confirmCash(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    const adminUserId = Number(user?.userId || user?.sub || user?.user_id);
    return this.ordersService.confirmCash(id, adminUserId);
  }

  @Patch(':id/cash/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'แอดมินปฏิเสธเงินสดจากไรเดอร์ ให้กลับเป็น PENDING เพื่อส่งใหม่ (เฉพาะ Admin)' })
  @ApiParam({ name: 'id', type: Number, description: 'รหัสงานจัดส่ง (delivery_id)' })
  @ApiResponse({ status: 200, description: 'ปรับสถานะกลับเป็น PENDING สำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบงานจัดส่ง' })
  rejectCash(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.rejectCash(id);
  }
}

