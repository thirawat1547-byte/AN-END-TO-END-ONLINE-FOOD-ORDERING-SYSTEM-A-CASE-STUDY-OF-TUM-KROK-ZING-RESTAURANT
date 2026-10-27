import { Injectable, ExecutionContext, Logger, Inject, forwardRef } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { isOAuthConfigured } from '../oauth.util';
import { AuthService } from '../auth.service';

@Injectable()
export class LineAuthGuard extends AuthGuard('line') {
  private readonly logger = new Logger('LineAuthGuard');

  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext): any {
    if (!isOAuthConfigured('line')) {
      const res = context.switchToHttp().getResponse<Response>();
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';

      if (process.env.ALLOW_MOCK_OAUTH === 'true') {
        this.logger.log('LINE OAuth not configured in .env -> Using Mock Dev Login');
        return this.authService.validateOAuthUser({
          provider: 'LINE',
          providerId: 'demo_user_line_1',
          email: 'customer.line@tumkrokzing.local',
          displayName: 'ลูกค้า LINE (Demo)',
          avatarUrl: 'https://profile.line-scdn.net/0h1demo',
        }).then((result) => {
          const query = new URLSearchParams({
            token: result.access_token,
            name: result.user.username || 'ลูกค้า LINE (Demo)',
            avatar: 'https://profile.line-scdn.net/0h1demo',
            email: result.user.email || 'customer.line@tumkrokzing.local',
          });
          if (!res.headersSent) {
            res.redirect(`${frontendUrl}/auth/callback?${query.toString()}`);
          }
          return false;
        }).catch((mockErr) => {
          this.logger.error('Failed to create mock LINE user:', mockErr);
          if (!res.headersSent) {
            res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('จำลองการเข้าสู่ระบบไม่สำเร็จ')}`);
          }
          return false;
        });
      }

      this.logger.warn('LINE OAuth is not configured in .env. Redirecting to login.');
      if (!res.headersSent) {
        res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('ระบบ LINE Login ยังไม่ได้ตั้งค่า กรุณากรอก LINE_CHANNEL_ID และ LINE_CHANNEL_SECRET ใน .env')}`);
      }
      return false;
    }

    this.logger.log('LINE OAuth flow initiated');
    try {
      const result = super.canActivate(context);
      if (result instanceof Promise) {
        return result.catch((err) => {
          this.logger.error('LINE OAuth error:', err?.message || err);
          const res = context.switchToHttp().getResponse<Response>();
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
          if (!res.headersSent) {
            res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('ไม่สามารถเข้าสู่ระบบด้วย LINE ได้ในขณะนี้')}`);
          }
          return false;
        });
      }
      return result;
    } catch (err: any) {
      this.logger.error('LINE OAuth sync error:', err?.message || err);
      const res = context.switchToHttp().getResponse<Response>();
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      if (!res.headersSent) {
        res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('ไม่สามารถเข้าสู่ระบบด้วย LINE ได้ในขณะนี้')}`);
      }
      return false;
    }
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // ⚠️ passport-line-auth เรียก handleRequest ซ้ำ 2 ครั้ง:
    //   ครั้งที่ 1: มี user (SUCCESS)
    //   ครั้งที่ 2: ไม่มี user (FAILED)
    // ถ้าเราไม่ดักไว้ req.user จะถูก overwrite เป็น null
    // แก้โดย: ถ้าเคยได้ user แล้ว ให้ใช้ตัวที่เก็บไว้ ไม่ overwrite ด้วย null
    if (err) {
      this.logger.error('LINE Auth Error:', err?.message || err);
    }

    const req = context.switchToHttp().getRequest();

    if (user) {
      this.logger.log(`LINE Auth SUCCESS - Provider ID: ${user.providerId}, Email: ${user.email}`);
      req._oauthUser = user;
      return user;
    }

    // ถ้าไม่มี user แต่เคยเก็บไว้แล้ว → ใช้ตัวเดิม (ป้องกัน overwrite)
    if (req._oauthUser) {
      this.logger.warn('LINE handleRequest called again without user - using cached user');
      return req._oauthUser;
    }

    return null;
  }
}
