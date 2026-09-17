import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        username: string;
        email: string | null;
        phone_number: string | null;
        address: string | null;
        role: string;
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
    getProfile(userId: number): Promise<{
        username: string;
        email: string;
        phone_number: string;
        address: string;
        role: string;
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
