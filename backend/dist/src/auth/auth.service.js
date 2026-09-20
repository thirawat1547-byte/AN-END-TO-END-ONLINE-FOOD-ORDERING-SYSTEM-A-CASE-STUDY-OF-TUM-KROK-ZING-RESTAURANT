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
    async register(dto) {
        const existingUser = await this.prisma.user.findFirst({
            where: { username: dto.username },
        });
        if (existingUser) {
            throw new common_1.ConflictException('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว');
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