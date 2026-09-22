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
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const prisma_service_1 = require("../../prisma.service");
const auth_service_1 = require("../auth.service");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(prisma, authService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'tumkrokzing_secret_key_2026',
        });
        this.prisma = prisma;
        this.authService = authService;
    }
    async validate(payload) {
        const user = await this.prisma.user.findUnique({
            where: { user_id: payload.sub },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('ผู้ใช้งานนี้ไม่มีอยู่ในระบบแล้ว');
        }
        if (payload.session_id) {
            const activeSession = await this.authService.getActiveSession(payload.sub);
            if (activeSession && activeSession !== payload.session_id) {
                throw new common_1.UnauthorizedException('SESSION_TERMINATED: บัญชีของคุณถูกเข้าสู่ระบบจากอุปกรณ์อื่นแล้ว');
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
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        auth_service_1.AuthService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map