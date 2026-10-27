import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ChatRole {
  USER = 'user',
  MODEL = 'model',
}

export class ChatHistoryItemDto {
  @ApiProperty({
    description: 'ผู้ส่งข้อความ (user หรือ model)',
    enum: ChatRole,
    example: 'user',
  })
  @IsEnum(ChatRole)
  role: ChatRole;

  @ApiProperty({
    description: 'เนื้อหาข้อความในประวัติการสนทนา',
    example: 'มีส้มตำอะไรแนะนำบ้างครับ',
  })
  @IsString()
  @IsNotEmpty()
  text: string;
}

export class AskChatbotDto {
  @ApiProperty({
    description: 'ข้อความคำถามจากลูกค้า',
    example: 'แนะนำเมนูเด็ดรสแซ่บของร้านตำครกซิ่งหน่อยครับ',
  })
  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุข้อความคำถาม' })
  message: string;

  @ApiPropertyOptional({
    description: 'ประวัติการสนทนาก่อนหน้า เพื่อให้บอทจำบริบทได้ต่อเนื่อง',
    type: [ChatHistoryItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatHistoryItemDto)
  history?: ChatHistoryItemDto[];

  @ApiPropertyOptional({
    description: 'หมายเลขโต๊ะ (ถ้าลูกค้ากำลังนั่งสั่งที่โต๊ะในร้าน)',
    example: 'T-05',
  })
  @IsOptional()
  @IsString()
  tableNumber?: string;
}

export class ChatbotReplyDto {
  @ApiProperty({
    description: 'ข้อความคำตอบจากน้องซิ่ง (Gemini AI)',
    example: 'สวัสดีจ้า ยินดีต้อนรับสู่ร้านตำครกซิ่งแซ่บๆ นะคะ! เมนูเด็ดห้ามพลาด...',
  })
  reply: string;

  @ApiPropertyOptional({
    description: 'ปุ่มคำถามแนะนำต่อเนื่องที่เกี่ยวข้อง',
    example: ['ส้มตำปูปลาร้าราคาเท่าไหร่?', 'มีโปรโมชั่นอะไรบ้างตอนนี้?', 'ดูเมนูเครื่องดื่ม'],
  })
  suggestedQuestions?: string[];

  @ApiProperty({
    description: 'เวลาที่ตอบกลับ',
    example: '2026-10-24T21:00:00.000Z',
  })
  timestamp: string;
}
