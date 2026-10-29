import { Controller, Get, Patch, Post, Body, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings() {
    return this.settingsService.getSettings();
  }

  // เฉพาะแอดมินเท่านั้น: ตั้งค่านี้รวมเบอร์พร้อมเพย์ที่ลูกค้าโอนเงินเข้า
  @Patch()
  @UseGuards(JwtAuthGuard)
  async updateSettings(@Body() dto: UpdateSettingsDto, @Req() req: any) {
    if (String(req?.user?.role || '').toUpperCase() !== 'ADMIN') {
      throw new ForbiddenException('เฉพาะผู้ดูแลร้าน (Admin) เท่านั้นที่แก้ไขตั้งค่าร้านได้');
    }
    return this.settingsService.updateSettings(dto);
  }

  @Post('toggle')
  async toggleStatus() {
    return this.settingsService.toggleStatus();
  }
}
