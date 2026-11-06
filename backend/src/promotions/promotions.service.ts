import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

// ต้นวัน (00:00) ตามเวลาไทยของวันที่ระบุ
const startOfThaiDay = (d: Date) => {
  const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(d);
  return new Date(`${ymd}T00:00:00+07:00`);
};

// วันหมดอายุ = สิ้นวัน (23:59:59) ตามเวลาไทย ถ้าส่งมาแค่วันที่ (YYYY-MM-DD)
const toExpiryDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T23:59:59+07:00`) : new Date(value);

@Injectable()
export class PromotionsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PromotionsService.name);
  private expiryTimer?: NodeJS.Timeout;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureUserClaimedPromotionsTable();
    await this.seedDefaultPromotionsIfEmpty();
    await this.cleanupExpiredPromotions();
    this.expiryTimer = setInterval(() => void this.cleanupExpiredPromotions(), 10 * 60_000);
  }

  onModuleDestroy() {
    if (this.expiryTimer) clearInterval(this.expiryTimer);
  }

  // สร้างตาราง USER_CLAIMED_PROMOTIONS สำหรับเก็บประวัติการกดรับโค้ดของแต่ละ User
  private async ensureUserClaimedPromotionsTable() {
    try {
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS USER_CLAIMED_PROMOTIONS (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          promo_id INT NOT NULL,
          is_used BOOLEAN DEFAULT FALSE,
          claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          used_at TIMESTAMP NULL,
          UNIQUE KEY uq_user_promo (user_id, promo_id)
        );
      `);
      this.logger.log('Ensured USER_CLAIMED_PROMOTIONS table exists');
    } catch (err) {
      this.logger.error('Failed to ensure USER_CLAIMED_PROMOTIONS table', err);
    }
  }

  // เติมข้อมูลโปรโมชันเริ่มต้นลงในตาราง PROMOTIONS หากยังไม่มี
  private async seedDefaultPromotionsIfEmpty() {
    try {
      const count = await this.prisma.promotion.count();
      if (count === 0) {
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);

        const defaults = [
          {
            code: 'ZING50',
            discount_type: 'FIXED',
            discount_value: 50,
            min_order_price: 300,
            expiry_date: nextYear,
          },
          {
            code: 'SEP10',
            discount_type: 'PERCENTAGE',
            discount_value: 10,
            min_order_price: 200,
            expiry_date: nextYear,
          },
          {
            code: 'WELCOME100',
            discount_type: 'FIXED',
            discount_value: 100,
            min_order_price: 500,
            expiry_date: nextYear,
          },
          {
            code: 'DELIVERY20',
            discount_type: 'FIXED',
            discount_value: 20,
            min_order_price: 200,
            expiry_date: nextYear,
          },
        ];

        for (const item of defaults) {
          await this.prisma.promotion.create({ data: item });
        }
        this.logger.log('Seeded default promotions');
      }
    } catch (err) {
      this.logger.warn('Could not seed default promotions:', err.message);
    }
  }

  // 1. ดึงโปรโมชันทั้งหมด
  async findAll() {
    const promos = await this.prisma.promotion.findMany({
      orderBy: { promo_id: 'desc' },
      include: { _count: { select: { orders: true } } },
    });
    // used_count = จำนวนออเดอร์ที่ใช้โค้ดนี้ (หน้าแอดมินแสดง "ใช้งานแล้ว X ครั้ง")
    return promos.map(({ _count, ...p }) => ({ ...p, used_count: _count.orders }));
  }

  // 2. ดึงโปรโมชันเฉพาะรายการที่เปิดใช้งาน ถึงวันเริ่มแล้ว และยังไม่หมดอายุ
  async findActive() {
    const now = new Date();
    return this.prisma.promotion.findMany({
      where: {
        is_active: true,
        start_date: { lte: now },
        expiry_date: {
          gte: now,
        },
      },
      orderBy: { expiry_date: 'asc' },
    });
  }

  // 3. ดูรายละเอียดตาม ID
  async findOne(promo_id: number) {
    const promo = await this.prisma.promotion.findUnique({
      where: { promo_id },
    });
    if (!promo) {
      throw new NotFoundException(`ไม่พบโปรโมชันรหัส #${promo_id}`);
    }
    return promo;
  }

  // 4. ตรวจสอบโค้ดส่วนลดว่าถูกต้องและยังไม่หมดอายุ
  async findByCode(code: string) {
    const cleanCode = (code || '').trim().toUpperCase();
    const promo = await this.prisma.promotion.findUnique({
      where: { code: cleanCode },
    });
    if (!promo || !promo.is_active || new Date(promo.expiry_date) < new Date()) {
      throw new NotFoundException('โค้ดส่วนลดนี้ไม่ถูกต้อง ปิดใช้งาน หรือหมดอายุแล้ว');
    }
    if (new Date(promo.start_date) > new Date()) {
      throw new NotFoundException('โค้ดส่วนลดนี้ยังไม่ถึงวันเริ่มใช้งาน');
    }
    return promo;
  }

  // 5. User กดเก็บโค้ดโปรโมชันเข้ากระเป๋าของตนเอง
  async claimPromotion(userId: number, promoId: number) {
    const promo = await this.findOne(promoId);
    if (!promo.is_active) {
      throw new BadRequestException('ขออภัย โปรโมชันนี้ถูกปิดใช้งานแล้ว');
    }
    if (new Date(promo.expiry_date) < new Date()) {
      throw new BadRequestException('ขออภัย โค้ดโปรโมชันนี้หมดอายุแล้ว ไม่สามารถเก็บได้');
    }
    if (new Date(promo.start_date) > new Date()) {
      throw new BadRequestException('โค้ดโปรโมชันนี้ยังไม่ถึงวันเริ่มใช้งาน');
    }

    try {
      await this.prisma.$executeRawUnsafe(
        `INSERT INTO USER_CLAIMED_PROMOTIONS (user_id, promo_id) 
         VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE claimed_at = claimed_at;`,
        userId,
        promoId,
      );
      return {
        success: true,
        message: `เก็บโค้ดส่วนลด "${promo.code}" สำเร็จ! สามารถนำไปใช้เป็นส่วนลดได้ที่หน้าชำระเงินออนไลน์`,
        promo_id: promoId,
        code: promo.code,
      };
    } catch (err) {
      throw new BadRequestException('ไม่สามารถเก็บโค้ดโปรโมชันได้: ' + err.message);
    }
  }

  // 6. ดึงรายการโค้ดที่ User คนนี้กดเก็บไว้ทั้งหมด
  async getMyPromotions(userId: number) {
    try {
      const rows: any[] = await this.prisma.$queryRawUnsafe(
        `SELECT 
           ucp.id AS claim_id,
           ucp.promo_id,
           ucp.is_used,
           ucp.claimed_at,
           ucp.used_at,
           p.code,
           p.discount_type,
           p.discount_value,
           p.min_order_price,
           p.expiry_date,
           p.is_active
         FROM USER_CLAIMED_PROMOTIONS ucp
         JOIN PROMOTIONS p ON ucp.promo_id = p.promo_id
         WHERE ucp.user_id = ?
         ORDER BY ucp.is_used ASC, p.expiry_date ASC;`,
        userId,
      );

      return rows.map((r) => ({
        claim_id: Number(r.claim_id),
        promo_id: Number(r.promo_id),
        is_used: Boolean(r.is_used),
        claimed_at: r.claimed_at,
        used_at: r.used_at,
        code: r.code,
        discount_type: r.discount_type,
        discount_value: Number(r.discount_value),
        min_order_price: Number(r.min_order_price || 0),
        expiry_date: r.expiry_date,
        is_active: r.is_active === undefined ? true : Boolean(r.is_active),
        is_expired: new Date(r.expiry_date) < new Date(),
      }));
    } catch (err) {
      this.logger.warn(`Could not get claimed promotions for user #${userId}:`, err.message);
      return [];
    }
  }

  // 7. สร้างโปรโมชันใหม่ (Admin) — วันเริ่มล็อกเป็นวันนี้เสมอ (แก้ทีหลังได้ในหน้าแก้ไข)
  async create(createDto: CreatePromotionDto) {
    const existing = await this.prisma.promotion.findUnique({
      where: { code: createDto.code.trim().toUpperCase() },
    });
    if (existing) {
      throw new BadRequestException('รหัสโปรโมชันนี้ถูกใช้งานแล้ว');
    }

    const startDate = startOfThaiDay(new Date());
    const expiryDate = toExpiryDate(createDto.expiry_date);
    if (expiryDate < startDate) {
      throw new BadRequestException('วันหมดอายุต้องไม่ก่อนวันเริ่ม (วันนี้)');
    }

    return this.prisma.promotion.create({
      data: {
        code: createDto.code.trim().toUpperCase(),
        discount_type: createDto.discount_type.toUpperCase(),
        discount_value: createDto.discount_value,
        min_order_price: createDto.min_order_price ?? 0,
        start_date: startDate,
        expiry_date: expiryDate,
        is_active: createDto.is_active ?? true,
      },
    });
  }

  // 8. แก้ไขโปรโมชัน (Admin)
  async update(promo_id: number, updateDto: UpdatePromotionDto) {
    const current = await this.findOne(promo_id);

    const startDate = updateDto.start_date ? startOfThaiDay(new Date(updateDto.start_date)) : current.start_date;
    const expiryDate = updateDto.expiry_date ? toExpiryDate(updateDto.expiry_date) : current.expiry_date;
    if (expiryDate < startDate) {
      throw new BadRequestException('วันหมดอายุต้องไม่ก่อนวันเริ่ม');
    }
    // โปรที่หมดอายุแล้วเปิดใช้ใหม่ไม่ได้ ต้องเลื่อนวันหมดอายุก่อน
    if (updateDto.is_active === true && expiryDate < new Date()) {
      throw new BadRequestException('โปรโมชันนี้หมดอายุแล้ว กรุณาแก้วันหมดอายุก่อนเปิดใช้งาน');
    }

    return this.prisma.promotion.update({
      where: { promo_id },
      data: {
        ...updateDto,
        code: updateDto.code ? updateDto.code.trim().toUpperCase() : undefined,
        discount_type: updateDto.discount_type ? updateDto.discount_type.toUpperCase() : undefined,
        start_date: updateDto.start_date ? startDate : undefined,
        expiry_date: updateDto.expiry_date ? expiryDate : undefined,
      },
    });
  }

  // 10. จัดการโปรที่หมดอายุ (รันตอนเปิดระบบและทุก 10 นาที)
  //  - ไม่เคยถูกใช้ในออเดอร์ → ลบทิ้ง (พร้อมคูปองที่ลูกค้ากดเก็บไว้)
  //  - เคยถูกใช้แล้ว → ปิดใช้งานไว้ ไม่ลบ เพื่อให้ประวัติออเดอร์ยังอ้างถึงโปรนี้ได้
  async cleanupExpiredPromotions() {
    try {
      const expired = await this.prisma.promotion.findMany({
        where: { expiry_date: { lt: new Date() } },
        select: { promo_id: true, code: true, is_active: true, _count: { select: { orders: true } } },
      });

      for (const promo of expired) {
        if (promo._count.orders === 0) {
          await this.prisma.$executeRawUnsafe('DELETE FROM USER_CLAIMED_PROMOTIONS WHERE promo_id = ?', promo.promo_id);
          await this.prisma.promotion.delete({ where: { promo_id: promo.promo_id } });
          this.logger.log(`ลบโปรโมชัน ${promo.code} ที่หมดอายุและไม่เคยถูกใช้`);
        } else if (promo.is_active) {
          await this.prisma.promotion.update({ where: { promo_id: promo.promo_id }, data: { is_active: false } });
          this.logger.log(`ปิดใช้งานโปรโมชัน ${promo.code} ที่หมดอายุ (เคยใช้ใน ${promo._count.orders} ออเดอร์)`);
        }
      }
    } catch (err: any) {
      this.logger.warn(`จัดการโปรโมชันหมดอายุไม่สำเร็จ: ${err?.message}`);
    }
  }

  // 9. ลบโปรโมชัน (Admin)
  async remove(promo_id: number) {
    await this.findOne(promo_id);

    return this.prisma.promotion.delete({
      where: { promo_id },
    });
  }
}