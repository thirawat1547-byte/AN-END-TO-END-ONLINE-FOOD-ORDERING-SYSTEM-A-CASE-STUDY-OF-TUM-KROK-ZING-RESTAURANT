import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { isOAuthConfigured } from '../oauth.util';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  private readonly logger = new Logger('GoogleAuthGuard');

  canActivate(context: ExecutionContext) {
    if (!isOAuthConfigured('google')) {
      const res = context.switchToHttp().getResponse<Response>();
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      this.logger.warn('Google OAuth is not configured in .env. Redirecting to login.');
      if (!res.headersSent) {
        res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('ระบบ Google Login ยังไม่ได้ตั้งค่า กรุณาแจ้งผู้ดูแลระบบ')}`);
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
