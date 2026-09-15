import { Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly prisma;
    constructor(prisma: PrismaService);
    validate(payload: {
        sub: number;
        username: string;
        role: string;
    }): Promise<{
        user_id: number;
        username: string;
        email: string;
        role: string;
    }>;
}
export {};
