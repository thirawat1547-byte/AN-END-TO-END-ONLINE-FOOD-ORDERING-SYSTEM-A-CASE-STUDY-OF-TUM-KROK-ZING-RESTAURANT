import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'ลงทะเบียนผู้ใช้งานใหม่' })
  @ApiResponse({ status: 201, description: 'ลงทะเบียนสำเร็จ' })
  @ApiResponse({ status: 409, description: 'ชื่อผู้ใช้งานซ้ำในระบบ' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'เข้าสู่ระบบเพื่อรับ JWT Access Token' })
  @ApiResponse({ status: 200, description: 'เข้าสู่ระบบสำเร็จ ได้รับ Token' })
  @ApiResponse({ status: 401, description: 'ข้อมูลเข้าสู่ระบบไม่ถูกต้อง' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'ดูข้อมูลโปรไฟล์ผู้ใช้งานปัจจุบัน (ต้องแนบ Token)' })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลสำเร็จ' })
  @ApiResponse({ status: 401, description: 'Token ไม่ถูกต้องหรือหมดอายุ' })
  getProfile(@CurrentUser() user: any) {
    const userId = user.userId || user.sub || user.user_id;
    return this.authService.getProfile(Number(userId));
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'อัปเดตข้อมูลส่วนตัว / ที่อยู่จัดส่งเดลิเวอรี่' })
  @ApiResponse({ status: 200, description: 'อัปเดตโปรไฟล์สำเร็จ' })
  updateProfile(
    @CurrentUser() user: any,
    @Body() updateDto: UpdateProfileDto,
  ) {
    const userId = user.userId || user.sub || user.user_id;
    return this.authService.updateProfile(Number(userId), updateDto);
  }
}