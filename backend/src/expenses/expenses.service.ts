import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RecordFuelExpenseDto } from './dto/record-fuel-expense.dto';

@Injectable()
export class ExpensesService implements OnModuleInit {
  private readonly logger = new Logger(ExpensesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureFuelLogsTable();
  }

  // สร้างตาราง FUEL_LOGS ในกรณีที่ฐานข้อมูลยังไม่ได้รัน Migration
  private async ensureFuelLogsTable() {
    try {
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS FUEL_LOGS (
          fuel_log_id INT AUTO_INCREMENT PRIMARY KEY,
          log_date DATE UNIQUE NOT NULL,
          price_per_liter DECIMAL(6, 2) NOT NULL,
          liters DECIMAL(5, 2) NOT NULL,
          amount DECIMAL(10, 2) DEFAULT 300.00,
          recorded_by INT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_fuel_logs_recorded_by (recorded_by)
        );
      `);
    } catch (err: any) {
      this.logger.warn(`Could not ensure FUEL_LOGS table: ${err.message}`);
    }
  }

  // 1. บันทึกหรืออัปเดตราคาน้ำมันประจำวัน (Upsert)
  async recordFuel(dto: RecordFuelExpenseDto, userId?: number) {
    // ดึงค่าคอนฟิกจาก STORE_SETTINGS (Fallback: daily_amount = 300, tank_capacity = 8.1)
    const storeSetting = await this.prisma.storeSetting.findUnique({
      where: { id: 1 },
    });

    const dailyAmount = storeSetting?.fuel_daily_amount
      ? Number(storeSetting.fuel_daily_amount)
      : 300;
    const tankCapacity = storeSetting?.fuel_tank_liters
      ? Number(storeSetting.fuel_tank_liters)
      : 8.1;

    // ยอดเงินค่าน้ำมันคิดตายตัวตามคอนฟิก (300 บาท)
    const amount = dailyAmount;

    // คำนวณจำนวนลิตร: liters = Math.min(Number((300 / dto.price_per_liter).toFixed(2)), 8.1)
    const calculatedLiters = Number((dailyAmount / dto.price_per_liter).toFixed(2));
    const liters = Math.min(calculatedLiters, tankCapacity);

    // กำหนดวันที่บันทึก (ถ้าไม่ส่งมา ให้ใช้วันที่ปัจจุบันตามเวลาประเทศไทย Asia/Bangkok)
    const bangkokTodayStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());

    const targetDateStr = dto.log_date ? dto.log_date.slice(0, 10) : bangkokTodayStr;
    const targetDate = new Date(`${targetDateStr}T00:00:00.000Z`);

    // ตรวจสอบ user ID ป้องกัน Foreign Key Constraint Error
    let validUserId: number | null = null;
    if (userId) {
      const userExists = await this.prisma.user.findUnique({
        where: { user_id: Number(userId) },
        select: { user_id: true },
      });
      if (userExists) {
        validUserId = userExists.user_id;
      }
    }

    // บันทึกลงตาราง FuelLog แบบ Upsert (หากวันที่ log_date นั้นมีบันทึกอยู่แล้วให้อัปเดตใหม่)
    return this.prisma.fuelLog.upsert({
      where: {
        log_date: targetDate,
      },
      create: {
        log_date: targetDate,
        price_per_liter: dto.price_per_liter,
        liters: liters,
        amount: amount,
        recorded_by: validUserId,
      },
      update: {
        price_per_liter: dto.price_per_liter,
        liters: liters,
        amount: amount,
        recorded_by: validUserId,
      },
      include: {
        recorder: {
          select: {
            user_id: true,
            username: true,
            role: true,
          },
        },
      },
    });
  }

  // 2. ดึงรายการบันทึกค่าน้ำมันทั้งหมด เรียงจากวันที่ล่าสุด (log_date: 'desc') รองรับตัวกรองช่วงวันที่ (from, to)
  async findAllFuelLogs(query?: { from?: string; to?: string }) {
    const where: any = {};

    if (query?.from || query?.to) {
      where.log_date = {};

      if (query.from) {
        const fromStr = query.from.slice(0, 10);
        where.log_date.gte = new Date(`${fromStr}T00:00:00.000Z`);
      }

      if (query.to) {
        const toStr = query.to.slice(0, 10);
        where.log_date.lte = new Date(`${toStr}T23:59:59.999Z`);
      }

      if (Object.keys(where.log_date).length === 0) {
        delete where.log_date;
      }
    }

    return this.prisma.fuelLog.findMany({
      where,
      orderBy: {
        log_date: 'desc',
      },
      include: {
        recorder: {
          select: {
            user_id: true,
            username: true,
            role: true,
          },
        },
      },
    });
  }

  // 3. คำนวณรายจ่ายค่าน้ำมันรวมสำหรับแดชบอร์ด
  //    - วันใดที่มีบันทึกใน FUEL_LOGS ให้นับตามยอด amount นั้น (300 บาท)
  //    - วันใดที่ร้านเปิด (มีออเดอร์ COMPLETED) แต่แอดมินยังไม่ได้บันทึกราคาน้ำมัน ให้ระบบนับรายจ่าย 300 บาท/วันให้อัตโนมัติ
  async calculateFuelExpense(from?: Date, to?: Date) {
    const storeSetting = await this.prisma.storeSetting.findUnique({
      where: { id: 1 },
    });
    const dailyAmount = storeSetting?.fuel_daily_amount
      ? Number(storeSetting.fuel_daily_amount)
      : 300;

    // 1. ดึงรายการใน FUEL_LOGS ตามช่วงวันที่
    const fuelWhere: any = {};
    if (from || to) {
      fuelWhere.log_date = {};
      if (from) fuelWhere.log_date.gte = from;
      if (to) fuelWhere.log_date.lte = to;
    }

    const recordedLogs = await this.prisma.fuelLog.findMany({
      where: fuelWhere,
      orderBy: { log_date: 'asc' },
    });

    const recordedDateSet = new Set<string>();
    let recordedTotal = 0;

    for (const log of recordedLogs) {
      const dateStr = log.log_date.toISOString().slice(0, 10);
      recordedDateSet.add(dateStr);
      recordedTotal += Number(log.amount);
    }

    // 2. ดึงวันที่ร้านเปิดทำการและมีออเดอร์ COMPLETED ตามช่วงวันที่
    const orderWhere: any = {
      status: 'COMPLETED',
    };
    if (from || to) {
      orderWhere.created_at = {};
      if (from) orderWhere.created_at.gte = from;
      if (to) orderWhere.created_at.lte = to;
    }

    const completedOrders = await this.prisma.order.findMany({
      where: orderWhere,
      select: { created_at: true },
    });

    const completedOrderDaysSet = new Set<string>();
    for (const ord of completedOrders) {
      const dateStr = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(ord.created_at);
      completedOrderDaysSet.add(dateStr);
    }

    // 3. หาวันที่ร้านเปิดและมีออเดอร์ COMPLETED แต่แอดมินยังไม่ได้บันทึกราคาน้ำมัน
    const unrecordedOpenDays: string[] = [];
    for (const day of completedOrderDaysSet) {
      if (!recordedDateSet.has(day)) {
        unrecordedOpenDays.push(day);
      }
    }

    const autoEstimatedAmount = unrecordedOpenDays.length * dailyAmount;
    const totalFuelExpense = recordedTotal + autoEstimatedAmount;

    return {
      total_fuel_expense: totalFuelExpense,
      daily_amount: dailyAmount,
      recorded_days: recordedLogs.length,
      recorded_amount: recordedTotal,
      unrecorded_days: unrecordedOpenDays.length,
      unrecorded_amount: autoEstimatedAmount,
      unrecorded_dates: unrecordedOpenDays,
      logs: recordedLogs,
    };
  }
}

