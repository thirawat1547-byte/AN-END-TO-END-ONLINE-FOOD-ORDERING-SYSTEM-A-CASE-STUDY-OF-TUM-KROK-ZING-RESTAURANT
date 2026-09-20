import { Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma.service';
import { AuthService } from '../auth.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly prisma;
    private readonly authService;
    constructor(prisma: PrismaService, authService: AuthService);
    validate(payload: {
        sub: number;
        username: string;
        role: string;
        session_id?: string;
    }): Promise<{
        user_id: number;
        username: string;
        email: string;
        role: string;
        session_id: string;
    }>;
}
export {};
