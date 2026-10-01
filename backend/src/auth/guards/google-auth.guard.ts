import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  private readonly logger = new Logger('GoogleAuthGuard');

  canActivate(context: ExecutionContext) {
    this.logger.log('Google OAuth flow initiated');
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // ถ้ามี error หรือไม่มี user → แสดงว่า Passport validate ไม่ผ่าน
    if (err || !user) {
      this.logger.error('=== Google Auth FAILED ===');
      this.logger.error('Error:', err?.message || err || 'No error object');
      this.logger.error('Info:', JSON.stringify(info) || 'No info');
      this.logger.error('User:', user || 'null');

      // ถ้า response ยังไม่ถูกส่ง ให้ redirect ไป frontend
      const res = context.switchToHttp().getResponse();
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const errorDetail = err?.message || 'google_auth_failed';
      if (!res.headersSent) {
        return res.redirect(
          `${frontendUrl}/login?error=${encodeURIComponent(errorDetail)}`,
        );
      }
      return null;
    }

    this.logger.log(`Google Auth SUCCESS - Provider ID: ${user.providerId}, Email: ${user.email}`);
    return user;
  }
}
