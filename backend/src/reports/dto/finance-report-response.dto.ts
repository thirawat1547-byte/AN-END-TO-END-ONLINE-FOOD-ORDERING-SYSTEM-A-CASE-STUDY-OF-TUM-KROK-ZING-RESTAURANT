import { ApiProperty } from '@nestjs/swagger';

export class FinanceRevenueBreakdownDto {
  @ApiProperty({ example: 4500.0, description: 'ยอดชำระผ่านบัตรเดบิต/เครดิต CARD (บาท)' })
  card: number;

  @ApiProperty({ example: 6200.0, description: 'ยอดชำระผ่าน PROMPTPAY (บาท)' })
  promptpay: number;

  @ApiProperty({ example: 1800.0, description: 'ยอดชำระด้วยเงินสด CASH (บาท)' })
  cash: number;
}

export class FinanceExpensesBreakdownDto {
  @ApiProperty({ example: 3500.0, description: 'ค่าวัตถุดิบ (บาท)' })
  ingredients: number;

  @ApiProperty({ example: 1200.0, description: 'ค่าน้ำมันรถส่งของ (บาท)' })
  fuel: number;

  @ApiProperty({ example: 450.0, description: 'ค่ารอบไรเดอร์ (บาท)' })
  rider_fee: number;

  @ApiProperty({ example: 157.5, description: 'ค่าธรรมเนียม Stripe (บาท)' })
  stripe_fee: number;
}

export class FinanceTimeBreakdownDto {
  @ApiProperty({
    example: '2026-11-05',
    description: 'ป้ายกำกับช่วงเวลา (day: YYYY-MM-DD, week: YYYY-Www, month: YYYY-MM)',
  })
  period: string;

  @ApiProperty({ example: 2500.0, description: 'รายรับรวมของช่วงเวลานี้ (บาท)' })
  revenue: number;

  @ApiProperty({ example: 1000.0, description: 'รายรับช่องทาง CARD ของช่วงนี้ (บาท)' })
  revenue_card: number;

  @ApiProperty({ example: 1200.0, description: 'รายรับช่องทาง PROMPTPAY ของช่วงนี้ (บาท)' })
  revenue_promptpay: number;

  @ApiProperty({ example: 300.0, description: 'รายรับช่องทาง CASH ของช่วงนี้ (บาท)' })
  revenue_cash: number;

  @ApiProperty({ type: FinanceRevenueBreakdownDto, description: 'รายละเอียดรายรับแยกตามช่องทาง' })
  revenue_breakdown: FinanceRevenueBreakdownDto;

  @ApiProperty({ example: 950.0, description: 'รายจ่ายรวมของช่วงเวลานี้ (บาท)' })
  expenses: number;

  @ApiProperty({ type: FinanceExpensesBreakdownDto, description: 'รายละเอียดรายจ่ายแยกตามประเภท' })
  expenses_breakdown: FinanceExpensesBreakdownDto;

  @ApiProperty({ example: 1550.0, description: 'กำไรสุทธิของช่วงเวลานี้ (บาท)' })
  net_profit: number;
}

export class FinanceReportResponseDto {
  @ApiProperty({ example: '2026-10-06', description: 'วันที่เริ่มต้นรายงาน (YYYY-MM-DD)' })
  start_date: string;

  @ApiProperty({ example: '2026-11-05', description: 'วันที่สิ้นสุดรายงาน (YYYY-MM-DD)' })
  end_date: string;

  @ApiProperty({ example: 'day', enum: ['day', 'week', 'month'], description: 'การจัดกลุ่มช่วงเวลา' })
  group: string;

  @ApiProperty({ example: 12500.0, description: 'รายรับรวมทั้งหมด (บาท)' })
  total_revenue: number;

  @ApiProperty({ example: 4500.0, description: 'รายรับผ่านบัตร CARD ทั้งหมด (บาท)' })
  revenue_card: number;

  @ApiProperty({ example: 6200.0, description: 'รายรับผ่าน PROMPTPAY ทั้งหมด (บาท)' })
  revenue_promptpay: number;

  @ApiProperty({ example: 1800.0, description: 'รายรับผ่านเงินสด CASH ทั้งหมด (บาท)' })
  revenue_cash: number;

  @ApiProperty({ example: 5307.5, description: 'รายจ่ายรวมทั้งหมด (บาท)' })
  total_expenses: number;

  @ApiProperty({ example: 3500.0, description: 'รายจ่ายค่าวัตถุดิบทั้งหมด (บาท)' })
  total_ingredients: number;

  @ApiProperty({ example: 1200.0, description: 'รายจ่ายค่าน้ำมันทั้งหมด (บาท)' })
  total_fuel: number;

  @ApiProperty({ example: 450.0, description: 'รายจ่ายค่ารอบไรเดอร์ทั้งหมด (บาท)' })
  total_rider_fee: number;

  @ApiProperty({ example: 157.5, description: 'รายจ่ายค่าธรรมเนียม Stripe ทั้งหมด (บาท)' })
  total_stripe_fee: number;

  @ApiProperty({ example: 7192.5, description: 'กำไรสุทธิทั้งหมด (total_revenue - total_expenses) (บาท)' })
  net_profit: number;

  @ApiProperty({ example: 57.54, description: 'อัตรากำไรสุทธิ (%)' })
  profit_margin_percentage: number;

  @ApiProperty({ type: [FinanceTimeBreakdownDto], description: 'ข้อมูลสำหรับทำกราฟ Time-series Breakdown' })
  breakdown: FinanceTimeBreakdownDto[];
}

