import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        username: string;
        email: string | null;
        phone_number: string | null;
        address: string | null;
        role: string;
        user_id: number;
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            user_id: number;
            username: string;
            email: string;
            phone_number: string;
            role: string;
        };
    }>;
    getProfile(user: any): Promise<{
        username: string;
        email: string;
        phone_number: string;
        address: string;
        role: string;
        user_id: number;
    }>;
    updateProfile(user: any, updateDto: UpdateProfileDto): Promise<{
        username: string;
        email: string;
        phone_number: string;
        address: string;
        role: string;
        user_id: number;
    }>;
}
