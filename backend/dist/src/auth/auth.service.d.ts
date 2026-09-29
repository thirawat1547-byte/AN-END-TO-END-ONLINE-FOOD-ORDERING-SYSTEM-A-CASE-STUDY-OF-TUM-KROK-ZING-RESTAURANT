import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
export interface OAuthUserProfile {
    provider: string;
    providerId: string;
    email?: string;
    displayName?: string;
    avatarUrl?: string;
}
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        role: string;
        username: string;
        email: string | null;
        phone_number: string | null;
        address: string | null;
        user_id: number;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            user_id: number;
            username: string;
            email: string;
            phone_number: string;
            role: string;
        };
    }>;
    validateOAuthUser(profile: OAuthUserProfile): Promise<{
        access_token: string;
        user: {
            user_id: any;
            username: any;
            email: any;
            phone_number: any;
            role: any;
        };
    }>;
    getProfile(userId: number): Promise<{
        role: string;
        username: string;
        email: string;
        phone_number: string;
        address: string;
        user_id: number;
    }>;
    updateProfile(userId: number, dto: UpdateProfileDto): Promise<{
        username: string;
        email: string;
        phone_number: string;
        address: string;
        role: string;
        user_id: number;
    }>;
}
