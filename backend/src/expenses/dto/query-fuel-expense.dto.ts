import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QueryFuelExpenseDto {
  @ApiPropertyOptional({
    example: '2026-11-01',
    description: 'วันที่เริ่มต้น เช่น 2026-11-01 หรือ ISO 8601',
  })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({
    example: '2026-11-30',
    description: 'วันที่สิ้นสุด เช่น 2026-11-30 หรือ ISO 8601',
  })
  @IsOptional()
  @IsString()
  to?: string;
}

