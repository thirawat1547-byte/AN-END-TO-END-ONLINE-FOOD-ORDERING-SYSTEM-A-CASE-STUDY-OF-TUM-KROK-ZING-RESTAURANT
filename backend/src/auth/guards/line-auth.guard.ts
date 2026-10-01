import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LineAuthGuard extends AuthGuard('line') {
  private readonly logger = new Logger('LineAuthGuard');

  canActivate(context: ExecutionContext) {
    this.logger.log('LINE OAuth flow initiated');
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      this.logger.error('=== LINE Auth FAILED ===');
      this.logger.error('Error:', err?.message || err || 'No error object');
      this.logger.error('Info:', JSON.stringify(info) || 'No info');
      this.logger.error('User:', user || 'null');

      const res = context.switchToHttp().getResponse();
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const errorDetail = err?.message || 'line_auth_failed';
      if (!res.headersSent) {
        return res.redirect(
          `${frontendUrl}/login?error=${encodeURIComponent(errorDetail)}`,
        );
      }
      return null;
    }

    this.logger.log(`LINE Auth SUCCESS - Provider ID: ${user.providerId}, Email: ${user.email}`);
    return user;
  }
}
