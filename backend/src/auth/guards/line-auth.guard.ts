import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { isOAuthConfigured } from '../oauth.util';

@Injectable()
export class LineAuthGuard extends AuthGuard('line') {
  private readonly logger = new Logger('LineAuthGuard');

  canActivate(context: ExecutionContext) {
    if (!isOAuthConfigured('line')) {
      const res = context.switchToHttp().getResponse<Response>();
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      this.logger.warn('LINE OAuth is not configured in .env. Redirecting to login.');
      if (!res.headersSent) {
        res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('ระบบ LINE Login ยังไม่ได้ตั้งค่า กรุณาแจ้งผู้ดูแลระบบ')}`);
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
