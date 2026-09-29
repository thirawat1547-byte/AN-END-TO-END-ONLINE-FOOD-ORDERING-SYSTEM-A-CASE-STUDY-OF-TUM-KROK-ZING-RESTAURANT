import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        role: string;
        username: string;
        email: string | null;
        phone_number: string | null;
        address: string | null;
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
        role: string;
        username: string;
        email: string;
        phone_number: string;
        address: string;
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
    googleAuth(): void;
    googleAuthCallback(req: any, res: Response): Promise<void>;
    facebookAuth(): void;
    facebookAuthCallback(req: any, res: Response): Promise<void>;
    lineAuth(): void;
    lineAuthCallback(req: any, res: Response): Promise<void>;
    private handleOAuthSuccess;
}
