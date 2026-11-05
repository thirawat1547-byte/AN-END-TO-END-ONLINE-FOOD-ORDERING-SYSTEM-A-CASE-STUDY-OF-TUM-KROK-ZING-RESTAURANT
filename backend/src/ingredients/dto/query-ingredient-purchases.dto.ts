import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QueryIngredientPurchasesDto {
  @ApiPropertyOptional({
    description: 'วันที่เริ่มต้น เช่น 2026-11-01 หรือ ISO 8601 string (ตัวอย่าง: 2026-11-01T00:00:00Z)',
    example: '2026-11-01',
  })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({
    description: 'วันที่สิ้นสุด เช่น 2026-11-30 หรือ ISO 8601 string (ตัวอย่าง: 2026-11-30T23:59:59Z)',
    example: '2026-11-30',
  })
  @IsOptional()
  @IsString()
  to?: string;
}

