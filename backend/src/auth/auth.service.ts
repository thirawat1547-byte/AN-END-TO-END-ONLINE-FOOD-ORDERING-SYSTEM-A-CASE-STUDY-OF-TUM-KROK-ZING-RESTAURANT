import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  // Cache เก็บ active session ของแต่ละ user_id ในหน่วยความจำเพื่อความเร็วสูงสุด
  private readonly activeSessions = new Map<number, string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    await this.ensureSessionTable();
    await this.loadActiveSessions();
  }

  // สร้างตาราง USER_ACTIVE_SESSIONS ในฐานข้อมูลหากยังไม่มี
  private async ensureSessionTable() {
    try {
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS USER_ACTIVE_SESSIONS (
          user_id INT PRIMARY KEY,
          session_id VARCHAR(100) NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
      `);
      this.logger.log('Ensured USER_ACTIVE_SESSIONS table exists');
    } catch (err) {
      this.logger.error('Failed to ensure USER_ACTIVE_SESSIONS table', err);
    }
  }

  // โหลดเซสชันเดิมจากฐานข้อมูลเข้ามาไว้ในหน่วยความจำ
  private async loadActiveSessions() {
    try {
      const rows: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT user_id, session_id FROM USER_ACTIVE_SESSIONS;
      `);
      if (Array.isArray(rows)) {
        for (const row of rows) {
          this.activeSessions.set(Number(row.user_id), String(row.session_id));
        }
        this.logger.log(`Loaded ${rows.length} active sessions into memory`);
      }
    } catch (err) {
      this.logger.warn('Could not load active sessions from DB:', err.message);
    }
  }

  // ดึง session_id ล่าสุดของผู้ใช้
  async getActiveSession(userId: number): Promise<string | null> {
    if (this.activeSessions.has(userId)) {
      return this.activeSessions.get(userId) || null;
    }

    try {
      const rows: any[] = await this.prisma.$queryRawUnsafe(
        'SELECT session_id FROM USER_ACTIVE_SESSIONS WHERE user_id = ? LIMIT 1;',
        userId,
      );
      if (rows && rows.length > 0) {
        const sid = String(rows[0].session_id);
        this.activeSessions.set(userId, sid);
        return sid;
      }
    } catch (err) {
      this.logger.warn(`Could not query session for user #${userId}:`, err.message);
    }

    return null;
  }

  // เคลียร์เซสชันเมื่อออกจากระบบ
  async logout(userId: number): Promise<void> {
    this.activeSessions.delete(userId);
    try {
      await this.prisma.$executeRawUnsafe(
        'DELETE FROM USER_ACTIVE_SESSIONS WHERE user_id = ?;',
        userId,
      );
      this.logger.log(`Session cleared for user #${userId}`);
    } catch (err) {
      this.logger.warn(`Failed to delete session for user #${userId}:`, err.message);
    }
  }

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

    // 🛑 บังคับ Single Active Session (1 บัญชีเข้าได้แค่ 1 เครื่องพร้อมกัน)
    // สร้าง Session ID ใหม่ และบันทึกลง Database เพื่อให้อุปกรณ์เดิมถูกเตะออกทันทีแบบ Real-time
    const sessionId = randomUUID();
    this.activeSessions.set(user.user_id, sessionId);

    try {
      await this.prisma.$executeRawUnsafe(`
        REPLACE INTO USER_ACTIVE_SESSIONS (user_id, session_id, updated_at)
        VALUES (?, ?, NOW());
      `, user.user_id, sessionId);
      this.logger.log(`User #${user.user_id} (${user.username}) logged in with new session: ${sessionId}`);
    } catch (err) {
      this.logger.error(`Failed to persist active session for user #${user.user_id}:`, err);
    }

    const payload = {
      sub: user.user_id,
      username: user.username,
      role: normalizedRole,
      session_id: sessionId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      session_id: sessionId,
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
      },
    });
  }
}