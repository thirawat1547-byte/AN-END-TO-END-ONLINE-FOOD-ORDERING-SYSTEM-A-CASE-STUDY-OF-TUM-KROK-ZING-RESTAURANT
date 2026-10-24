import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'tumkrokzing_secret_key_2026',
    });
  }

  async validate(payload: { sub: number; username: string; role: string }) {
    const user = await this.prisma.user.findUnique({
      where: { user_id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('ผู้ใช้งานนี้ไม่มีอยู่ในระบบแล้ว');
    }

    return {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }
}