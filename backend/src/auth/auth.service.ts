import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

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