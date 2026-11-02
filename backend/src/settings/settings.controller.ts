import { Controller, Get, Patch, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'ดูข้อมูลการตั้งค่าร้านค้า (เวลาเปิด-ปิด, พร้อมเพย์, ค่าส่ง)' })
  @ApiResponse({ status: 200, description: 'ข้อมูลการตั้งค่าร้านค้า' })
  async getSettings() {
    return this.settingsService.getSettings();
  }

  // เฉพาะแอดมินเท่านั้น: ตั้งค่านี้รวมเบอร์พร้อมเพย์ที่ลูกค้าโอนเงินเข้า
  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'แก้ไขข้อมูลการตั้งค่าร้านค้า (ADMIN)' })
  @ApiResponse({ status: 200, description: 'อัปเดตการตั้งค่าร้านค้าสำเร็จ' })
  async updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(dto);
  }

  // ป้องกันบุคคลภายนอกเปิด/ปิดร้าน: อนุญาตเฉพาะ ADMIN เท่านั้น
  @Post('toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'เปิด/ปิดร้านค้าชั่วคราว (ADMIN)' })
  @ApiResponse({ status: 200, description: 'สลับสถานะเปิด/ปิดร้านค้าสำเร็จ' })
  async toggleStatus() {
    return this.settingsService.toggleStatus();
  }
}
