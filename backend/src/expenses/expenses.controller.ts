import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { RecordFuelExpenseDto } from './dto/record-fuel-expense.dto';
import { QueryFuelExpenseDto } from './dto/query-fuel-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Expenses')
@Controller('expenses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post('fuel')
  @ApiOperation({ summary: 'บันทึกหรืออัปเดตราคาน้ำมันประจำวัน (เฉพาะ Admin)' })
  @ApiResponse({ status: 201, description: 'บันทึกราคาน้ำมันประจำวันสำเร็จ' })
  @ApiResponse({ status: 400, description: 'ข้อมูลราคาน้ำมันไม่ถูกต้อง' })
  @ApiResponse({ status: 401, description: 'ไม่ได้เข้าสู่ระบบ (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์เข้าถึง (เฉพาะ Admin)' })
  recordFuel(
    @Body() dto: RecordFuelExpenseDto,
    @CurrentUser() user: any,
  ) {
    const userId = Number(user?.userId || user?.sub || user?.user_id);
    return this.expensesService.recordFuel(dto, userId);
  }

  @Get('fuel/summary')
  @ApiOperation({ summary: 'สรุปภาพรวมรายจ่ายค่าน้ำมันตามช่วงวันที่ (รวมวันเปิดร้านอัตโนมัติ 300 บาท/วัน)' })
  @ApiQuery({ name: 'from', required: false, type: String, description: 'วันที่เริ่มต้น เช่น 2026-11-01' })
  @ApiQuery({ name: 'to', required: false, type: String, description: 'วันที่สิ้นสุด เช่น 2026-11-30' })
  @ApiResponse({ status: 200, description: 'คำนวณรายจ่ายค่าน้ำมันสำเร็จ' })
  getFuelSummary(@Query() query: QueryFuelExpenseDto) {
    const fromDate = query.from ? new Date(`${query.from.slice(0, 10)}T00:00:00.000Z`) : undefined;
    const toDate = query.to ? new Date(`${query.to.slice(0, 10)}T23:59:59.999Z`) : undefined;
    return this.expensesService.calculateFuelExpense(fromDate, toDate);
  }

  @Get('fuel')
  @ApiOperation({ summary: 'ดูประวัติค่าน้ำมันตามช่วงวันที่ (เฉพาะ Admin)' })
  @ApiQuery({ name: 'from', required: false, type: String, description: 'วันที่เริ่มต้น เช่น 2026-11-01' })
  @ApiQuery({ name: 'to', required: false, type: String, description: 'วันที่สิ้นสุด เช่น 2026-11-30' })
  @ApiResponse({ status: 200, description: 'ดึงรายการบันทึกค่าน้ำมันสำเร็จ' })
  @ApiResponse({ status: 401, description: 'ไม่ได้เข้าสู่ระบบ (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์เข้าถึง (เฉพาะ Admin)' })
  findAllFuelLogs(@Query() query: QueryFuelExpenseDto) {
    return this.expensesService.findAllFuelLogs(query);
  }
}

