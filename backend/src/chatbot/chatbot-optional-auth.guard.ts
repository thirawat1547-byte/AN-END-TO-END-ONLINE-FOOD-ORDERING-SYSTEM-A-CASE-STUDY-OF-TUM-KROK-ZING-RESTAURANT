import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * ระบุตัวตนลูกค้าแบบไม่บังคับสำหรับแชทบอท:
 * - มี token ที่ถูกต้อง → req.user = ลูกค้าคนนั้น (ใช้จำกัดให้เห็นเฉพาะออเดอร์ของตัวเอง)
 * - ไม่มี token / token หมดอายุ / ถูกเตะออกจาก session → req.user = null แต่ยังแชทได้ตามปกติ
 */
@Injectable()
export class ChatbotOptionalAuthGuard extends AuthGuard('jwt') {
  handleRequest(_err: any, user: any) {
    return user || null;
  }
}
