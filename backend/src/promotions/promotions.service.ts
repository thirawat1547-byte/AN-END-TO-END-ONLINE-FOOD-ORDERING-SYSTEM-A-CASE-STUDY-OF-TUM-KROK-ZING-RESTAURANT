import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable()
export class PromotionsService implements OnModuleInit {
  private readonly logger = new Logger(PromotionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureUserClaimedPromotionsTable();
    await this.seedDefaultPromotionsIfEmpty();
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
    return this.prisma.promotion.findMany({
      orderBy: { promo_id: 'desc' },
    });
  }

  // 2. ดึงโปรโมชันเฉพาะรายการที่ยังไม่หมดอายุ
  async findActive() {
    return this.prisma.promotion.findMany({
      where: {
        expiry_date: {
          gte: new Date(),
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
    if (!promo || new Date(promo.expiry_date) < new Date()) {
      throw new NotFoundException('โค้ดส่วนลดนี้ไม่ถูกต้อง หรือหมดอายุแล้ว');
    }
    return promo;
  }

  // 5. User กดเก็บโค้ดโปรโมชันเข้ากระเป๋าของตนเอง
  async claimPromotion(userId: number, promoId: number) {
    const promo = await this.findOne(promoId);
    if (new Date(promo.expiry_date) < new Date()) {
      throw new BadRequestException('ขออภัย โค้ดโปรโมชันนี้หมดอายุแล้ว ไม่สามารถเก็บได้');
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
           p.expiry_date
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
        is_expired: new Date(r.expiry_date) < new Date(),
      }));
    } catch (err) {
      this.logger.warn(`Could not get claimed promotions for user #${userId}:`, err.message);
      return [];
    }
  }

  // 7. สร้างโปรโมชันใหม่ (Admin)
  async create(createDto: CreatePromotionDto) {
    const existing = await this.prisma.promotion.findUnique({
      where: { code: createDto.code.trim().toUpperCase() },
    });
    if (existing) {
      throw new BadRequestException('รหัสโปรโมชันนี้ถูกใช้งานแล้ว');
    }

    return this.prisma.promotion.create({
      data: {
        code: createDto.code.trim().toUpperCase(),
        discount_type: createDto.discount_type.toUpperCase(),
        discount_value: createDto.discount_value,
        min_order_price: createDto.min_order_price ?? 0,
        expiry_date: new Date(createDto.expiry_date),
      },
    });
  }

  // 8. แก้ไขโปรโมชัน (Admin)
  async update(promo_id: number, updateDto: UpdatePromotionDto) {
    await this.findOne(promo_id);

    return this.prisma.promotion.update({
      where: { promo_id },
      data: {
        ...updateDto,
        code: updateDto.code ? updateDto.code.trim().toUpperCase() : undefined,
        discount_type: updateDto.discount_type ? updateDto.discount_type.toUpperCase() : undefined,
        expiry_date: updateDto.expiry_date ? new Date(updateDto.expiry_date) : undefined,
      },
    });
  }

  // 9. ลบโปรโมชัน (Admin)
  async remove(promo_id: number) {
    await this.findOne(promo_id);

    return this.prisma.promotion.delete({
      where: { promo_id },
    });
  }
}