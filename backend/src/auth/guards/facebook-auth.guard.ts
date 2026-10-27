import { Injectable, ExecutionContext, Logger, Inject, forwardRef } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { isOAuthConfigured } from '../oauth.util';
import { AuthService } from '../auth.service';

@Injectable()
export class FacebookAuthGuard extends AuthGuard('facebook') {
  private readonly logger = new Logger('FacebookAuthGuard');

  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext): any {
    if (!isOAuthConfigured('facebook')) {
      const res = context.switchToHttp().getResponse<Response>();
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';

      if (process.env.ALLOW_MOCK_OAUTH === 'true') {
        this.logger.log('Facebook OAuth not configured in .env -> Using Mock Dev Login');
        return this.authService.validateOAuthUser({
          provider: 'FACEBOOK',
          providerId: 'demo_user_fb_1',
          email: 'customer.fb@tumkrokzing.local',
          displayName: 'ลูกค้า Facebook (Demo)',
          avatarUrl: 'https://graph.facebook.com/demo/picture',
        }).then((result) => {
          const query = new URLSearchParams({
            token: result.access_token,
            name: result.user.username || 'ลูกค้า Facebook (Demo)',
            avatar: 'https://graph.facebook.com/demo/picture',
            email: result.user.email || 'customer.fb@tumkrokzing.local',
          });
          if (!res.headersSent) {
            res.redirect(`${frontendUrl}/auth/callback?${query.toString()}`);
          }
          return false;
        }).catch((mockErr) => {
          this.logger.error('Failed to create mock Facebook user:', mockErr);
          if (!res.headersSent) {
            res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('จำลองการเข้าสู่ระบบไม่สำเร็จ')}`);
          }
          return false;
        });
      }

      this.logger.warn('Facebook OAuth is not configured in .env. Redirecting to login.');
      if (!res.headersSent) {
        res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('ระบบ Facebook Login ยังไม่ได้ตั้งค่า กรุณากรอก FACEBOOK_APP_ID และ FACEBOOK_APP_SECRET ใน .env')}`);
      }
      return false;
    }

    this.logger.log('Facebook OAuth flow initiated');
    try {
      const result = super.canActivate(context);
      if (result instanceof Promise) {
        return result.catch((err) => {
          this.logger.error('Facebook OAuth error:', err?.message || err);
          const res = context.switchToHttp().getResponse<Response>();
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
          if (!res.headersSent) {
            res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('ไม่สามารถเข้าสู่ระบบด้วย Facebook ได้ในขณะนี้')}`);
          }
          return false;
        });
      }
      return result;
    } catch (err: any) {
      this.logger.error('Facebook OAuth sync error:', err?.message || err);
      const res = context.switchToHttp().getResponse<Response>();
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      if (!res.headersSent) {
        res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('ไม่สามารถเข้าสู่ระบบด้วย Facebook ได้ในขณะนี้')}`);
      }
      return false;
    }
  }

  handleRequest(err: any, user: any, info: any) {
    if (err) {
      this.logger.error('Facebook Auth Error:', err?.message || err);
    }
    if (user) {
      this.logger.log(`Facebook Auth SUCCESS - Provider ID: ${user.providerId}, Email: ${user.email}`);
    }
    return user || null;
  }
}
