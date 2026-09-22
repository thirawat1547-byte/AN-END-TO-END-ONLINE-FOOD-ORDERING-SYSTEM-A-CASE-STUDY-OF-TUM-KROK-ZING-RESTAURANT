import { OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class AuthService implements OnModuleInit {
    private readonly prisma;
    private readonly jwtService;
    private readonly logger;
    private readonly activeSessions;
    constructor(prisma: PrismaService, jwtService: JwtService);
    onModuleInit(): Promise<void>;
    private ensureSessionTable;
    private loadActiveSessions;
    getActiveSession(userId: number): Promise<string | null>;
    logout(userId: number): Promise<void>;
    checkUsernameAvailable(username: string): Promise<{
        available: boolean;
        message: string;
    }>;
    checkPhoneAvailable(phone: string): Promise<{
        available: boolean;
        message: string;
    }>;
    checkEmailAvailable(email: string): Promise<{
        available: boolean;
        message: string;
    }>;
    register(dto: RegisterDto): Promise<{
        role: string;
        user_id: number;
        username: string;
        email: string | null;
        phone_number: string | null;
        address: string | null;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        session_id: `${string}-${string}-${string}-${string}-${string}`;
        user: {
            user_id: number;
            username: string;
            email: string;
            phone_number: string;
            role: string;
        };
    }>;
    getProfile(userId: number): Promise<{
        role: string;
        user_id: number;
        username: string;
        email: string;
        phone_number: string;
        address: string;
    }>;
    updateProfile(userId: number, dto: UpdateProfileDto): Promise<{
        user_id: number;
        username: string;
        email: string;
        phone_number: string;
        address: string;
        role: string;
    }>;
}
