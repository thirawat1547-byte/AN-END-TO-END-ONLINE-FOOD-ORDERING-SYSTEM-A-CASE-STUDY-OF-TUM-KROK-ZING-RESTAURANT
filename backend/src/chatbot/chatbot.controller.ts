import { Body, Controller, Get, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';
import { AskChatbotDto, ChatbotReplyDto } from './dto/chat-message.dto';

@ApiTags('Chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('ask')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'ส่งข้อความถาม-ตอบกับแชทบอทร้านอาหารตำครกซิ่ง (น้องส้มตำ AI)',
    description:
      'รับข้อความคำถามจากผู้ใช้ เชื่อมต่อกับ Google Gemini API เพื่อประมวลผลคำตอบอัตโนมัติ พร้อมส่งปุ่มคำถามแนะนำต่อเนื่อง',
  })
  @ApiResponse({
    status: 200,
    description: 'ประมวลผลคำตอบสำเร็จ',
    type: ChatbotReplyDto,
  })
  async ask(@Body() askDto: AskChatbotDto): Promise<ChatbotReplyDto> {
    return this.chatbotService.ask(askDto);
  }

  @Post('admin-ask')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'ส่งข้อความถาม-ตอบสำหรับแอดมิน/ผู้จัดการร้าน (น้องส้มตำ AI ผู้ช่วยผู้จัดการ)',
    description:
      'รับคำถามจากแอดมิน รายงานภาพรวมยอดขาย สต็อกวัตถุดิบ จอครัว KDS ผังโต๊ะอาหาร และการบริหารร้าน',
  })
  @ApiResponse({
    status: 200,
    description: 'ประมวลผลคำตอบสำหรับแอดมินสำเร็จ',
    type: ChatbotReplyDto,
  })
  async adminAsk(@Body() askDto: AskChatbotDto): Promise<ChatbotReplyDto> {
    return this.chatbotService.adminAsk(askDto);
  }

  @Get('suggested-questions')
  @ApiOperation({
    summary: 'ดึงรายการคำถามแนะนำเริ่มต้นสำหรับลูกค้า',
    description:
      'ส่งรายการคำถามยอดฮิตสำหรับนำไปแสดงผลเป็น Quick Reply Chips บนหน้าต่างแชทของลูกค้า',
  })
  @ApiResponse({
    status: 200,
    description: 'รายการคำถามแนะนำ',
    schema: {
      type: 'object',
      properties: {
        questions: {
          type: 'array',
          items: { type: 'string' },
          example: [
            '🌶️ เมนูเด็ดแนะนำของร้านตำครกซิ่งมีอะไรบ้าง?',
            '🔥 เลือกระดับความเผ็ดแบบไหนได้บ้าง?',
            '⏰ ร้านเปิด-ปิดกี่โมง และครัวปิดตอนไหน?',
          ],
        },
      },
    },
  })
  getSuggestedQuestions() {
    return {
      questions: this.chatbotService.getSuggestedQuestions(),
    };
  }

  @Get('health')
  @ApiOperation({
    summary: 'ตรวจสอบความพร้อมและสถานะการเชื่อมต่อกับ Gemini API',
  })
  @ApiResponse({
    status: 200,
    description: 'สถานะการทำงานของบริการแชทบอท',
  })
  checkHealth() {
    return this.chatbotService.checkHealth();
  }
}
