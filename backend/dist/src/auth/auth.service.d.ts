import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        username: string;
        email: string | null;
        phone_number: string | null;
        role: string;
        user_id: number;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            user_id: number;
            username: string;
            email: string;
            role: string;
        };
    }>;
}
