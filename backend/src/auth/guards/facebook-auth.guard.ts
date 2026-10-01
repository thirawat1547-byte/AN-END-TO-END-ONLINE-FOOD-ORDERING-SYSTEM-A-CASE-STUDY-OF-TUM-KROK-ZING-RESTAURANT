import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FacebookAuthGuard extends AuthGuard('facebook') {
  private readonly logger = new Logger('FacebookAuthGuard');

  canActivate(context: ExecutionContext) {
    this.logger.log('Facebook OAuth flow initiated');
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      this.logger.error('=== Facebook Auth FAILED ===');
      this.logger.error('Error:', err?.message || err || 'No error object');
      this.logger.error('Info:', JSON.stringify(info) || 'No info');
      this.logger.error('User:', user || 'null');

      const res = context.switchToHttp().getResponse();
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const errorDetail = err?.message || 'facebook_auth_failed';
      if (!res.headersSent) {
        return res.redirect(
          `${frontendUrl}/login?error=${encodeURIComponent(errorDetail)}`,
        );
      }
      return null;
    }

    this.logger.log(`Facebook Auth SUCCESS - Provider ID: ${user.providerId}, Email: ${user.email}`);
    return user;
  }
}
