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
      // เก็บ user ไว้ใน request เผื่อ handleRequest ถูกเรียกซ้ำ
      req._oauthUser = user;
      return user;
    }

    // ถ้าไม่มี user แต่เคยเก็บไว้แล้ว → ใช้ตัวเดิม (ป้องกัน overwrite)
    if (req._oauthUser) {
      this.logger.warn('LINE handleRequest called again without user - using cached user');
      return req._oauthUser;
    }

    // ไม่มี user จริงๆ (เช่น กรณี redirect ไป LINE ครั้งแรก)
    return null;
  }
}
