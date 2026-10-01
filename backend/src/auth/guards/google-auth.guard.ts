import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  private readonly logger = new Logger('GoogleAuthGuard');

  canActivate(context: ExecutionContext) {
    this.logger.log('Google OAuth flow initiated');
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // ⚠️ ห้าม redirect ที่นี่เด็ดขาด! เพราะ Passport อาจเรียก handleRequest ซ้ำหลายครั้ง
    // ให้ return user หรือ null แล้วให้ Controller จัดการ redirect แทน
    if (err) {
      this.logger.error('Google Auth Error:', err?.message || err);
    }
    if (user) {
      this.logger.log(`Google Auth SUCCESS - Provider ID: ${user.providerId}, Email: ${user.email}`);
    }
    return user || null;
  }
}
