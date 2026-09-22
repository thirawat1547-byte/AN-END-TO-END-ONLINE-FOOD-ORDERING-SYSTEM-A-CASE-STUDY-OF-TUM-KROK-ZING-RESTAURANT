import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    checkUsername(username: string): Promise<{
        available: boolean;
        message: string;
    }>;
    checkPhone(phone: string): Promise<{
        available: boolean;
        message: string;
    }>;
    checkEmail(email: string): Promise<{
        available: boolean;
        message: string;
    }>;
    register(registerDto: RegisterDto): Promise<{
        role: string;
        user_id: number;
        username: string;
        email: string | null;
        phone_number: string | null;
        address: string | null;
    }>;
    login(loginDto: LoginDto): Promise<{
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
    sessionCheck(user: any): {
        valid: boolean;
        user_id: any;
        username: any;
        role: any;
    };
    logout(user: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getProfile(user: any): Promise<{
        role: string;
        user_id: number;
        username: string;
        email: string;
        phone_number: string;
        address: string;
    }>;
    updateProfile(user: any, updateDto: UpdateProfileDto): Promise<{
        user_id: number;
        username: string;
        email: string;
        phone_number: string;
        address: string;
        role: string;
    }>;
}
