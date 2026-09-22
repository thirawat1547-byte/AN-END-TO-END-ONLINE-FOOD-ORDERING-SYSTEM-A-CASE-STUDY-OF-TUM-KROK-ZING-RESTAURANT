"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const crypto_1 = require("crypto");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../prisma.service");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(AuthService_1.name);
        this.activeSessions = new Map();
    }
    async onModuleInit() {
        await this.ensureSessionTable();
        await this.loadActiveSessions();
    }
    async ensureSessionTable() {
        try {
            await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS USER_ACTIVE_SESSIONS (
          user_id INT PRIMARY KEY,
          session_id VARCHAR(100) NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
      `);
            this.logger.log('Ensured USER_ACTIVE_SESSIONS table exists');
        }
        catch (err) {
            this.logger.error('Failed to ensure USER_ACTIVE_SESSIONS table', err);
        }
    }
    async loadActiveSessions() {
        try {
            const rows = await this.prisma.$queryRawUnsafe(`
        SELECT user_id, session_id FROM USER_ACTIVE_SESSIONS;
      `);
            if (Array.isArray(rows)) {
                for (const row of rows) {
                    this.activeSessions.set(Number(row.user_id), String(row.session_id));
                }
                this.logger.log(`Loaded ${rows.length} active sessions into memory`);
            }
        }
        catch (err) {
            this.logger.warn('Could not load active sessions from DB:', err.message);
        }
    }
    async getActiveSession(userId) {
        if (this.activeSessions.has(userId)) {
            return this.activeSessions.get(userId) || null;
        }
        try {
            const rows = await this.prisma.$queryRawUnsafe('SELECT session_id FROM USER_ACTIVE_SESSIONS WHERE user_id = ? LIMIT 1;', userId);
            if (rows && rows.length > 0) {
                const sid = String(rows[0].session_id);
                this.activeSessions.set(userId, sid);
                return sid;
            }
        }
        catch (err) {
            this.logger.warn(`Could not query session for user #${userId}:`, err.message);
        }
        return null;
    }
    async logout(userId) {
        this.activeSessions.delete(userId);
        try {
            await this.prisma.$executeRawUnsafe('DELETE FROM USER_ACTIVE_SESSIONS WHERE user_id = ?;', userId);
            this.logger.log(`Session cleared for user #${userId}`);
        }
        catch (err) {
            this.logger.warn(`Failed to delete session for user #${userId}:`, err.message);
        }
    }
    async checkUsernameAvailable(username) {
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
    async checkPhoneAvailable(phone) {
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
    async checkEmailAvailable(email) {
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
    async register(dto) {
        const existingUser = await this.prisma.user.findFirst({
            where: { username: dto.username },
        });
        if (existingUser) {
            throw new common_1.ConflictException('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว');
        }
        let cleanEmail = null;
        if (dto.email && dto.email.trim()) {
            cleanEmail = dto.email.trim().toLowerCase();
            const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com)$/i;
            if (!emailRegex.test(cleanEmail)) {
                throw new common_1.BadRequestException('อีเมลต้องลงท้ายด้วย @gmail.com หรือ @hotmail.com เท่านั้น');
            }
            const existingEmail = await this.prisma.user.findFirst({
                where: { email: cleanEmail },
            });
            if (existingEmail) {
                throw new common_1.ConflictException('อีเมลนี้ถูกใช้งานในระบบแล้ว กรุณาใช้อีเมลอื่น');
            }
        }
        else {
            throw new common_1.BadRequestException('กรุณากรอกอีเมล');
        }
        let cleanPhone = null;
        if (dto.phone_number && dto.phone_number.trim()) {
            cleanPhone = dto.phone_number.trim().replace(/[-\s]/g, '');
            if (cleanPhone.length !== 10) {
                throw new common_1.BadRequestException('เบอร์โทรศัพท์ต้องมีครบ 10 หลัก');
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
                throw new common_1.ConflictException('เบอร์โทรศัพท์นี้ถูกใช้งานในระบบแล้ว กรุณาใช้เบอร์อื่น');
            }
        }
        else {
            throw new common_1.BadRequestException('กรุณากรอกเบอร์โทรศัพท์');
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
    async login(dto) {
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
            throw new common_1.UnauthorizedException('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        }
        const normalizedRole = (user.role || 'CUSTOMER').toUpperCase();
        const sessionId = (0, crypto_1.randomUUID)();
        this.activeSessions.set(user.user_id, sessionId);
        try {
            await this.prisma.$executeRawUnsafe(`
        REPLACE INTO USER_ACTIVE_SESSIONS (user_id, session_id, updated_at)
        VALUES (?, ?, NOW());
      `, user.user_id, sessionId);
            this.logger.log(`User #${user.user_id} (${user.username}) logged in with new session: ${sessionId}`);
        }
        catch (err) {
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
    async getProfile(userId) {
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
            throw new common_1.NotFoundException('ไม่พบข้อมูลผู้ใช้งาน');
        }
        return {
            ...user,
            role: (user.role || 'CUSTOMER').toUpperCase(),
        };
    }
    async updateProfile(userId, dto) {
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map