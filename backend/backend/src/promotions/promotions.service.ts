import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

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
    const promo = await this.prisma.promotion.findUnique({
      where: { code },
    });
    if (!promo || new Date(promo.expiry_date) < new Date()) {
      throw new NotFoundException('โค้ดส่วนลดนี้ไม่ถูกต้อง หรือหมดอายุแล้ว');
    }
    return promo;
  }

  // 5. สร้างโปรโมชันใหม่
  async create(createDto: CreatePromotionDto) {
    const existing = await this.prisma.promotion.findUnique({
      where: { code: createDto.code },
    });
    if (existing) {
      throw new BadRequestException('รหัสโปรโมชันนี้ถูกใช้งานแล้ว');
    }

    return this.prisma.promotion.create({
      data: {
        code: createDto.code,
        discount_type: createDto.discount_type,
        discount_value: createDto.discount_value,
        min_order_price: createDto.min_order_price ?? 0,
        expiry_date: new Date(createDto.expiry_date),
      },
    });
  }

  // 6. แก้ไขโปรโมชัน
  async update(promo_id: number, updateDto: UpdatePromotionDto) {
    await this.findOne(promo_id);

    return this.prisma.promotion.update({
      where: { promo_id },
      data: {
        ...updateDto,
        expiry_date: updateDto.expiry_date ? new Date(updateDto.expiry_date) : undefined,
      },
    });
  }

  // 7. ลบโปรโมชัน
  async remove(promo_id: number) {
    await this.findOne(promo_id);

    return this.prisma.promotion.delete({
      where: { promo_id },
    });
  }
}