import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma.service';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'tumkrokzing_secret_key_2026',
    });
  }

  async validate(payload: { sub: number; username: string; role: string; session_id?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { user_id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('ผู้ใช้งานนี้ไม่มีอยู่ในระบบแล้ว');
    }

    // 🛑 ตรวจสอบ Single Active Session (1 บัญชีเข้าได้แค่ 1 เครื่องพร้อมกัน)
    // หากมีอุปกรณ์อื่นล็อกอินใหม่ session_id ใน Token เก่าจะไม่ตรงกับ activeSession ในระบบ
    if (payload.session_id) {
      const activeSession = await this.authService.getActiveSession(payload.sub);
      if (activeSession && activeSession !== payload.session_id) {
        throw new UnauthorizedException('SESSION_TERMINATED: บัญชีของคุณถูกเข้าสู่ระบบจากอุปกรณ์อื่นแล้ว');
      }
    }

    return {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
      session_id: payload.session_id,
    };
  }
}