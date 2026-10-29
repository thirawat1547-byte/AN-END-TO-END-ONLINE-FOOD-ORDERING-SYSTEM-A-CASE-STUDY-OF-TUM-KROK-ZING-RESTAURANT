// src/orders/dto/chat-message.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class OrderChatMessageDto {
  @ApiProperty({ example: 'customer', enum: ['customer', 'rider'], description: 'ผู้ส่งข้อความ' })
  @IsString()
  @IsIn(['customer', 'rider'])
  sender: string;

  @ApiProperty({ example: 'ถึงแล้วโทรหาได้เลยครับ', description: 'ข้อความแชท' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message: string;
}
