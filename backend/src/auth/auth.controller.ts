import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
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
import { SocialLoginDto } from './dto/social-login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { FacebookAuthGuard } from './guards/facebook-auth.guard';
import { LineAuthGuard } from './guards/line-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('check-username')
  @ApiOperation({ summary: 'ตรวจสอบว่าชื่อผู้ใช้ (Username) ซ้ำหรือไม่' })
  @ApiResponse({ status: 200, description: 'ผลการตรวจสอบชื่อผู้ใช้' })
  checkUsername(@Query('username') username: string) {
    return this.authService.checkUsernameAvailable(username);
  }

  @Get('check-phone')
  @ApiOperation({ summary: 'ตรวจสอบว่าเบอร์โทรศัพท์ซ้ำหรือไม่' })
  @ApiResponse({ status: 200, description: 'ผลการตรวจสอบเบอร์โทรศัพท์' })
  checkPhone(@Query('phone') phone: string) {
    return this.authService.checkPhoneAvailable(phone);
  }

  @Get('check-email')
  @ApiOperation({ summary: 'ตรวจสอบว่าอีเมลซ้ำหรือไม่' })
  @ApiResponse({ status: 200, description: 'ผลการตรวจสอบอีเมล' })
  checkEmail(@Query('email') email: string) {
    return this.authService.checkEmailAvailable(email);
  }

  @Post('register')
  @ApiOperation({ summary: 'ลงทะเบียนผู้ใช้งานใหม่' })
  @ApiResponse({ status: 201, description: 'ลงทะเบียนสำเร็จ' })
  @ApiResponse({ status: 409, description: 'ชื่อผู้ใช้งานหรือเบอร์โทรศัพท์ซ้ำในระบบ' })
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

  @Post('social-login')
  @ApiOperation({ summary: 'เข้าสู่ระบบด้วย Social Media (Google, Facebook, LINE)' })
  @ApiResponse({ status: 200, description: 'เข้าสู่ระบบด้วย Social Media สำเร็จ' })
  socialLogin(@Body() socialDto: SocialLoginDto) {
    return this.authService.socialLogin(socialDto);
  }

  @Get('session-check')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'ตรวจสอบสถานะเซสชันของอุปกรณ์ปัจจุบันแบบ Real-time' })
  @ApiResponse({ status: 200, description: 'เซสชันถูกต้องและยังใช้งานได้บนเครื่องนี้' })
  @ApiResponse({ status: 401, description: 'เซสชันหมดอายุหรือถูกเข้าสู่ระบบจากอุปกรณ์อื่นแล้ว' })
  sessionCheck(@CurrentUser() user: any) {
    return {
      valid: true,
      user_id: user.user_id,
      username: user.username,
      role: user.role,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'ออกจากระบบและเคลียร์เซสชัน' })
  @ApiResponse({ status: 200, description: 'ออกจากระบบสำเร็จ' })
  async logout(@CurrentUser() user: any) {
    const userId = user.userId || user.sub || user.user_id;
    if (userId) {
      await this.authService.logout(Number(userId));
    }
    return { success: true, message: 'ออกจากระบบสำเร็จ' };
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

  // --- Google OAuth ---
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'เข้าสู่ระบบด้วย Google' })
  googleAuth() {
    // Passport redirects to Google consent screen
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Callback URL สำหรับ Google OAuth' })
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    return this.handleOAuthSuccess(req.user, res);
  }

  // --- Facebook OAuth ---
  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({ summary: 'เข้าสู่ระบบด้วย Facebook' })
  facebookAuth() {
    // Passport redirects to Facebook OAuth screen
  }

  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({ summary: 'Callback URL สำหรับ Facebook OAuth' })
  async facebookAuthCallback(@Req() req: any, @Res() res: Response) {
    return this.handleOAuthSuccess(req.user, res);
  }

  // --- LINE OAuth ---
  @Get('line')
  @UseGuards(LineAuthGuard)
  @ApiOperation({ summary: 'เข้าสู่ระบบด้วย LINE' })
  lineAuth() {
    // Passport redirects to LINE Login screen
  }

  @Get('line/callback')
  @UseGuards(LineAuthGuard)
  @ApiOperation({ summary: 'Callback URL สำหรับ LINE OAuth' })
  async lineAuthCallback(@Req() req: any, @Res() res: Response) {
    return this.handleOAuthSuccess(req.user, res);
  }

  // Helper สำหรับจัดการผลลัพธ์ OAuth และส่ง Token กลับไปยัง Frontend
  // ⚠️ ตรวจสอบ res.headersSent ก่อนทุกครั้ง เพราะ Passport บางตัว (เช่น passport-line-auth)
  //    อาจเรียก callback ซ้ำหลายครั้ง ทำให้เกิด ERR_HTTP_HEADERS_SENT
  private async handleOAuthSuccess(userProfile: any, res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    try {
      if (!userProfile) {
        console.warn('OAuth: No user profile received from guard');
        if (!res.headersSent) {
          return res.redirect(
            `${frontendUrl}/login?error=${encodeURIComponent('ไม่สามารถดึงข้อมูลผู้ใช้งานได้')}`,
          );
        }
        return;
      }

      console.log('OAuth: Processing user profile -', userProfile.provider, userProfile.providerId);
      const result = await this.authService.validateOAuthUser(userProfile);
      console.log('OAuth: Token generated successfully for user #', result.user.user_id);

      if (!res.headersSent) {
        const query = new URLSearchParams({
          token: result.access_token,
          name: result.user.name || userProfile.displayName || '',
          avatar: result.user.avatar || userProfile.avatarUrl || '',
          email: result.user.email || userProfile.email || '',
        });
        return res.redirect(
          `${frontendUrl}/auth/callback?${query.toString()}`,
        );
      }
    } catch (err: any) {
      console.error('OAuth Callback processing error:', err?.message || err);
      if (!res.headersSent) {
        const msg = encodeURIComponent(
          err?.message || 'การเข้าสู่ระบบผ่าน Social Account ขัดข้อง',
        );
        return res.redirect(`${frontendUrl}/login?error=${msg}`);
      }
    }
  }
}
