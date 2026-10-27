import { Injectable, ExecutionContext, Logger, Inject, forwardRef } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { isOAuthConfigured } from '../oauth.util';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  private readonly logger = new Logger('GoogleAuthGuard');

  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext): any {
    if (!isOAuthConfigured('google')) {
      const res = context.switchToHttp().getResponse<Response>();
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';

      if (process.env.ALLOW_MOCK_OAUTH === 'true') {
        this.logger.log('Google OAuth not configured in .env -> Using Mock Dev Login');
        return this.authService.validateOAuthUser({
          provider: 'GOOGLE',
          providerId: 'demo_user_google_1',
          email: 'customer.google@tumkrokzing.local',
          displayName: 'ลูกค้า Google (Demo)',
          avatarUrl: 'https://lh3.googleusercontent.com/a/default-user',
        }).then((result) => {
          const query = new URLSearchParams({
            token: result.access_token,
            name: result.user.username || 'ลูกค้า Google (Demo)',
            avatar: 'https://lh3.googleusercontent.com/a/default-user',
            email: result.user.email || 'customer.google@tumkrokzing.local',
          });
          if (!res.headersSent) {
            res.redirect(`${frontendUrl}/auth/callback?${query.toString()}`);
          }
          return false;
        }).catch((mockErr) => {
          this.logger.error('Failed to create mock OAuth user:', mockErr);
          if (!res.headersSent) {
            res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('จำลองการเข้าสู่ระบบไม่สำเร็จ')}`);
          }
          return false;
        });
      }

      this.logger.warn('Google OAuth is not configured in .env. Redirecting to login.');
      if (!res.headersSent) {
        res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('ระบบ Google Login ยังไม่ได้ตั้งค่า กรุณากรอก GOOGLE_CLIENT_ID และ GOOGLE_CLIENT_SECRET ใน .env')}`);
      }
      return false;
    }

    this.logger.log('Google OAuth flow initiated');
    try {
      const result = super.canActivate(context);
      if (result instanceof Promise) {
        return result.catch((err) => {
          this.logger.error('Google OAuth error:', err?.message || err);
          const res = context.switchToHttp().getResponse<Response>();
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
          if (!res.headersSent) {
            res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('ไม่สามารถเข้าสู่ระบบด้วย Google ได้ในขณะนี้')}`);
          }
          return false;
        });
      }
      return result;
    } catch (err: any) {
      this.logger.error('Google OAuth sync error:', err?.message || err);
      const res = context.switchToHttp().getResponse<Response>();
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      if (!res.headersSent) {
        res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('ไม่สามารถเข้าสู่ระบบด้วย Google ได้ในขณะนี้')}`);
      }
      return false;
    }
  }

  handleRequest(err: any, user: any, info: any) {
    if (err) {
      this.logger.error('Google Auth Error:', err?.message || err);
    }
    if (user) {
      this.logger.log(`Google Auth SUCCESS - Provider ID: ${user.providerId}, Email: ${user.email}`);
    }
    return user || null;
  }
}
