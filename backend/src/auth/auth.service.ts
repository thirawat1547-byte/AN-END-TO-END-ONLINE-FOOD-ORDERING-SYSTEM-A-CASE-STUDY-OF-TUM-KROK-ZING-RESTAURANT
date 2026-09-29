import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

export interface OAuthUserProfile {
  provider: string;
  providerId: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
}


@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: { username: dto.username },
    });

    if (existingUser) {
      throw new ConflictException('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    const normalizedRole = (dto.role || 'CUSTOMER').toUpperCase();
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        password: hashedPassword,
        email: dto.email,
        phone_number: dto.phone_number,
        role: normalizedRole,
      },
    });

    const { password, ...result } = user;
    return { ...result, role: normalizedRole };
  }

  async login(dto: LoginDto) {
    const identifier = (dto.username || '').trim();
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { phone_number: identifier },
          { email: identifier },
        ],
      },
    });

    if (!user) {
      throw new UnauthorizedException('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }

    const normalizedRole = (user.role || 'CUSTOMER').toUpperCase();

    const payload = {
      sub: user.user_id,
      username: user.username,
      role: normalizedRole,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        phone_number: user.phone_number,
        role: normalizedRole,
      },
    };
  }

  // ยืนยันตัวตนหรือสมัครใหม่อัตโนมัติด้วย OAuth (Google, Facebook, LINE)
  async validateOAuthUser(profile: OAuthUserProfile) {
    const providerLower = (profile.provider || 'oauth').toLowerCase();
    const socialUsername = `${providerLower}_${profile.providerId}`;

    let user: any = null;

    // 1. ตรวจสอบว่ามีผู้ใช้อีเมลนี้ในระบบอยู่แล้วหรือไม่ (ถ้ามี email)
    if (profile.email) {
      user = await this.prisma.user.findFirst({
        where: { email: profile.email },
      });
    }

    // 2. ถ้าไม่พบจากอีเมล ให้ค้นหาจาก username รูปแบบ provider_id
    if (!user) {
      user = await this.prisma.user.findFirst({
        where: { username: socialUsername },
      });
    }

    // 3. ถ้ายังไม่เคยมีบัญชี ให้สร้าง (Auto-Register) อัตโนมัติ
    if (!user) {
      const randomPassword = `OAuth_${crypto.randomUUID()}_${Date.now()}`;
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await this.prisma.user.create({
        data: {
          username: socialUsername,
          password: hashedPassword,
          email: profile.email || null,
          role: 'CUSTOMER',
        },
      });
    }

    // 4. ออก JWT Access Token
    const normalizedRole = (user.role || 'CUSTOMER').toUpperCase();
    const payload = {
      sub: user.user_id,
      username: user.username,
      role: normalizedRole,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        phone_number: user.phone_number,
        role: normalizedRole,
      },
    };
  }


// ดึงข้อมูลโปรไฟล์ล่าสุดจาก Database
  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        username: true,
        email: true,
        phone_number: true,
        address: true,
        role: true,
        // ตัด created_at ออกแล้ว
      },
    });

    if (!user) {
      throw new NotFoundException('ไม่พบข้อมูลผู้ใช้งาน');
    }

    return {
      ...user,
      role: (user.role || 'CUSTOMER').toUpperCase(),
    };
  }

  // อัปเดตข้อมูลส่วนตัว / ที่อยู่จัดส่งเดลิเวอรี่
  async updateProfile(userId: number, dto: UpdateProfileDto) {
    await this.getProfile(userId);

    return this.prisma.user.update({
      where: { user_id: userId },
      data: dto,
      select: {
        user_id: true,
        username: true,
        email: true,
        phone_number: true,
        address: true,
        role: true,
        // ตัด updated_at ออกแล้ว
      },
    });
  }
}