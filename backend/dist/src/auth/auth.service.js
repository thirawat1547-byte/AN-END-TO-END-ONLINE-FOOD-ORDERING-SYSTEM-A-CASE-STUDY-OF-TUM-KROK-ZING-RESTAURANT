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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../prisma.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
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
        const user = await this.prisma.user.create({
            data: {
                username: dto.username,
                password: hashedPassword,
                email: dto.email,
                phone_number: dto.phone_number,
                role: dto.role || 'Customer',
            },
        });
        const { password, ...result } = user;
        return result;
    }
    async login(dto) {
        const user = await this.prisma.user.findFirst({
            where: { username: dto.username },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        }
        const payload = {
            sub: user.user_id,
            username: user.username,
            role: user.role,
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map