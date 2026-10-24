import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FacebookAuthGuard extends AuthGuard('facebook') {
  private readonly logger = new Logger('FacebookAuthGuard');

  canActivate(context: ExecutionContext) {
    this.logger.log('Facebook OAuth flow initiated');
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // ⚠️ ห้าม redirect ที่นี่เด็ดขาด! เพราะ Passport อาจเรียก handleRequest ซ้ำหลายครั้ง
    if (err) {
      this.logger.error('Facebook Auth Error:', err?.message || err);
    }
    if (user) {
      this.logger.log(`Facebook Auth SUCCESS - Provider ID: ${user.providerId}, Email: ${user.email}`);
    }
    return user || null;
  }
}
