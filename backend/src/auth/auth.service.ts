import {
  BadRequestException,
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
import * as crypto from 'crypto';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SocialLoginDto } from './dto/social-login.dto';

export interface OAuthUserProfile {
  provider: string;
  providerId: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
}


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

  // ตรวจสอบว่าชื่อผู้ใช้ (Username) ถูกใช้งานแล้วหรือยัง
  async checkUsernameAvailable(username: string): Promise<{ available: boolean; message: string }> {
    if (!username || !username.trim()) {
      return { available: false, message: 'กรุณากรอกชื่อผู้ใช้ (Username)' };
    }
    const cleanUsername = username.trim();
    if (cleanUsername.length < 3) {
      return { available: false, message: 'ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร' };
    }

    const existingUser = await this.prisma.user.findFirst({
      where: { username: cleanUsername },
    });

    if (existingUser) {
      return { available: false, message: 'ชื่อผู้ใช้นี้ถูกใช้งานในระบบแล้ว กรุณาใช้ชื่ออื่น' };
    }
    return { available: true, message: 'ชื่อผู้ใช้นี้สามารถใช้งานได้' };
  }

  // ตรวจสอบว่าเบอร์โทรศัพท์ถูกใช้งานแล้วหรือยัง
  async checkPhoneAvailable(phone: string): Promise<{ available: boolean; message: string }> {
    if (!phone || !phone.trim()) {
      return { available: false, message: 'กรุณากรอกเบอร์โทรศัพท์' };
    }
    const cleanPhone = phone.trim().replace(/[-\s]/g, '');
    if (cleanPhone.length !== 10) {
      return { available: false, message: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ต้องมี 10 หลัก)' };
    }

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone_number: cleanPhone },
          { phone_number: phone.trim() },
        ],
      },
    });

    if (existingUser) {
      return { available: false, message: 'เบอร์โทรศัพท์นี้ถูกใช้งานในระบบแล้ว กรุณาใช้เบอร์อื่น' };
    }
    return { available: true, message: 'เบอร์โทรศัพท์นี้สามารถใช้งานได้' };
  }

  // ตรวจสอบว่าอีเมลถูกใช้งานแล้วหรือยัง (ต้องเป็น @gmail.com หรือ @hotmail.com และห้ามซ้ำ)
  async checkEmailAvailable(email: string): Promise<{ available: boolean; message: string }> {
    if (!email || !email.trim()) {
      return { available: false, message: 'กรุณากรอกอีเมล' };
    }
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com)$/i;
    if (!emailRegex.test(cleanEmail)) {
      return { available: false, message: 'อีเมลต้องลงท้ายด้วย @gmail.com หรือ @hotmail.com เท่านั้น' };
    }

    const existingUser = await this.prisma.user.findFirst({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return { available: false, message: 'อีเมลนี้ถูกใช้งานในระบบแล้ว กรุณาใช้อีเมลอื่น' };
    }
    return { available: true, message: 'อีเมลนี้สามารถใช้งานได้' };
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: { username: dto.username },
    });

    if (existingUser) {
      throw new ConflictException('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว');
    }

    // 📧 ตรวจสอบโดเมนอีเมลต้องเป็น @gmail.com หรือ @hotmail.com เท่านั้น และห้ามซ้ำในระบบ
    let cleanEmail: string | null = null;
    if (dto.email && dto.email.trim()) {
      cleanEmail = dto.email.trim().toLowerCase();
      const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com)$/i;
      if (!emailRegex.test(cleanEmail)) {
        throw new BadRequestException('อีเมลต้องลงท้ายด้วย @gmail.com หรือ @hotmail.com เท่านั้น');
      }

      const existingEmail = await this.prisma.user.findFirst({
        where: { email: cleanEmail },
      });

      if (existingEmail) {
        throw new ConflictException('อีเมลนี้ถูกใช้งานในระบบแล้ว กรุณาใช้อีเมลอื่น');
      }
    } else {
      throw new BadRequestException('กรุณากรอกอีเมล');
    }

    // 🛑 ตรวจสอบเบอร์โทรศัพท์ต้องครบ 10 หลัก และห้ามซ้ำในระบบ
    let cleanPhone: string | null = null;
    if (dto.phone_number && dto.phone_number.trim()) {
      cleanPhone = dto.phone_number.trim().replace(/[-\s]/g, '');
      if (cleanPhone.length !== 10) {
        throw new BadRequestException('เบอร์โทรศัพท์ต้องมีครบ 10 หลัก');
      }

      const existingPhone = await this.prisma.user.findFirst({
        where: {
          OR: [
            { phone_number: cleanPhone },
            { phone_number: dto.phone_number.trim() },
          ],
        },
      });

      if (existingPhone) {
        throw new ConflictException('เบอร์โทรศัพท์นี้ถูกใช้งานในระบบแล้ว กรุณาใช้เบอร์อื่น');
      }
    } else {
      throw new BadRequestException('กรุณากรอกเบอร์โทรศัพท์');
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    const normalizedRole = (dto.role || 'CUSTOMER').toUpperCase();
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        password: hashedPassword,
        email: dto.email ? dto.email.trim() : null,
        phone_number: cleanPhone,
        address: dto.address ? dto.address.trim().substring(0, 255) : null,
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

  // เข้าสู่ระบบด้วย Social Login (Google, Facebook, LINE) ผ่าน REST API
  async socialLogin(dto: SocialLoginDto) {
    const provider = dto.provider.toLowerCase();
    const cleanEmail = dto.email ? dto.email.trim().toLowerCase() : null;
    const providerId = dto.providerId || randomUUID().substring(0, 8);

    // 1. ค้นหาผู้ใช้จากอีเมล หรือ username ที่เคยลงทะเบียนผ่าน Social
    let user = null;
    if (cleanEmail) {
      user = await this.prisma.user.findFirst({
        where: { email: cleanEmail },
      });
    }

    if (!user && dto.providerId) {
      const socialIdentifier = `${provider}_${providerId}`;
      user = await this.prisma.user.findFirst({
        where: { username: socialIdentifier },
      });
    }

    // 2. หากยังไม่มีบัญชี ให้สร้างบัญชีลูกค้าใหม่โดยอัตโนมัติ
    if (!user) {
      const baseName = (dto.name || `${provider}_user`).trim().replace(/[^a-zA-Z0-9_\u0E00-\u0E7F]/g, '_').toLowerCase();
      let uniqueUsername = `${provider}_${baseName.substring(0, 15)}`;

      const checkExists = await this.prisma.user.findFirst({
        where: { username: uniqueUsername },
      });
      if (checkExists) {
        uniqueUsername = `${uniqueUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
      }

      const randomPassword = randomUUID();
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await this.prisma.user.create({
        data: {
          username: uniqueUsername,
          password: hashedPassword,
          email: cleanEmail || `${uniqueUsername}@${provider}.auth`,
          role: 'CUSTOMER',
        },
      });
      this.logger.log(`Created new social account: ${user.username} (${provider})`);
    }

    const normalizedRole = (user.role || 'CUSTOMER').toUpperCase();

    // 3. กำหนด Session ID และบันทึกลง Database
    const sessionId = randomUUID();
    this.activeSessions.set(user.user_id, sessionId);

    try {
      await this.prisma.$executeRawUnsafe(`
        REPLACE INTO USER_ACTIVE_SESSIONS (user_id, session_id, updated_at)
        VALUES (?, ?, NOW());
      `, user.user_id, sessionId);
      this.logger.log(`User #${user.user_id} (${user.username}) logged in via ${provider}`);
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
    } else if (profile.email && !user.email) {
      try {
        user = await this.prisma.user.update({
          where: { user_id: user.user_id },
          data: { email: profile.email },
        });
      } catch (err) {
        this.logger.warn(`Could not sync email for user #${user.user_id}: ${err.message}`);
      }
    }

    // 4. ออก JWT Access Token และ Session ID
    const normalizedRole = (user.role || 'CUSTOMER').toUpperCase();
    const sessionId = randomUUID();
    this.activeSessions.set(user.user_id, sessionId);

    try {
      await this.prisma.$executeRawUnsafe(`
        REPLACE INTO USER_ACTIVE_SESSIONS (user_id, session_id, updated_at)
        VALUES (?, ?, NOW());
      `, user.user_id, sessionId);
    } catch (err) {
      this.logger.error(`Failed to persist active session for user #${user.user_id}:`, err);
    }

    const payload = {
      sub: user.user_id,
      username: user.username,
      name: profile.displayName || user.username,
      avatar: profile.avatarUrl || null,
      role: normalizedRole,
      session_id: sessionId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      session_id: sessionId,
      user: {
        user_id: user.user_id,
        username: user.username,
        name: profile.displayName || user.username,
        avatar: profile.avatarUrl || null,
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