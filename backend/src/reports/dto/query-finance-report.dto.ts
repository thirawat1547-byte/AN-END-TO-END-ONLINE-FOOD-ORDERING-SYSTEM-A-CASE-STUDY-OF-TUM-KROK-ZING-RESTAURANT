import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class QueryFinanceReportDto {
  @ApiPropertyOptional({
    example: '2026-10-06',
    description: 'วันที่เริ่มต้น เช่น 2026-10-06 (string YYYY-MM-DD, optional)',
  })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({
    example: '2026-11-05',
    description: 'วันที่สิ้นสุด เช่น 2026-11-05 (string YYYY-MM-DD, optional)',
  })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({
    enum: ['day', 'week', 'month'],
    default: 'day',
    description: 'การจัดกลุ่มช่วงเวลาสำหรับทำกราฟ (enum: day | week | month, default: day)',
  })
  @IsOptional()
  @IsIn(['day', 'week', 'month'])
  group?: 'day' | 'week' | 'month' = 'day';
}

