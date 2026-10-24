import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { PrismaService } from '../prisma.service';
import { AskChatbotDto, ChatbotReplyDto, ChatRole } from './dto/chat-message.dto';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private aiClient: GoogleGenAI | null = null;
  private readonly modelName: string;

  constructor(private readonly prisma: PrismaService) {
    const apiKey = process.env.GEMINI_API_KEY;
    this.modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      try {
        this.aiClient = new GoogleGenAI({ apiKey });
        this.logger.log(`🤖 เชื่อมต่อ Google Gemini API สำเร็จ (โมเดล: ${this.modelName})`);
      } catch (err) {
        this.logger.error('❌ ไม่สามารถสร้างอินสแตนซ์ GoogleGenAI ได้:', err);
      }
    } else {
      this.logger.warn(
        '⚠️ ยังไม่ได้ตั้งค่า GEMINI_API_KEY ในไฟล์ .env — แชทบอทจะทำงานในโหมดจำลอง (Fallback Mode)',
      );
    }
  }

  /**
   * ดึงข้อมูลเมนูและโปรโมชั่นล่าสุดจากฐานข้อมูลเพื่อป้อนเป็น Context ให้กับ Gemini
   */
  private async getRestaurantLiveContext(): Promise<string> {
    try {
      const [menus, promotions] = await Promise.all([
        this.prisma.menu.findMany({
          where: { is_available: true },
          select: {
            menu_id: true,
            menu_name: true,
            price: true,
            description: true,
            category: { select: { category_name: true } },
          },
          take: 40,
        }),
        this.prisma.promotion.findMany({
          where: {
            expiry_date: { gte: new Date() },
          },
          select: {
            code: true,
            discount_type: true,
            discount_value: true,
            min_order_price: true,
          },
        }),
      ]);

      let contextText = '\n--- ข้อมูลเมนูอาหารจริงในร้านปัจจุบัน ---\n';
      if (menus.length > 0) {
        contextText += menus
          .map(
            (m) =>
              `- [ID: ${m.menu_id}] ${m.menu_name} (หมวด: ${m.category.category_name}) ราคา ${Number(m.price)} บาท ${
                m.description ? `(รายละเอียด: ${m.description})` : ''
              }`,
          )
          .join('\n');
      } else {
        contextText +=
          '- ส้มตำปูปลาร้าแซ่บซิ่ง (60 บาท), ตำไทยไข่เค็ม (65 บาท), ตำซั่ว (65 บาท), คอหมูย่างสูตรเด็ด (95 บาท), ไก่ย่างเขาสวนกวาง (120 บาท), ต้มแซ่บกระดูกอ่อน (110 บาท), ข้าวเหนียว (15 บาท)\n';
      }

      contextText += '\n--- โปรโมชั่นและโค้ดส่วนลดที่ใช้ได้ปัจจุบัน ---\n';
      if (promotions.length > 0) {
        contextText += promotions
          .map(
            (p) =>
              `- โค้ด '${p.code}': ส่วนลด ${Number(p.discount_value)} ${
                p.discount_type === 'PERCENT' ? '%' : 'บาท'
              } (เมื่อสั่งขั้นต่ำ ${Number(p.min_order_price)} บาท)`,
          )
          .join('\n');
      } else {
        contextText += '- มีโปรโมชั่นสั่งครบ 300 บาทส่งฟรีในละแวกใกล้เคียง หรือติดตามโปรโมชั่นพิเศษหน้าร้าน\n';
      }

      return contextText;
    } catch (error) {
      this.logger.warn('ไม่สามารถดึงข้อมูลเมนู/โปรโมชันจากฐานข้อมูลได้ ใช้ข้อมูลพื้นฐานแทน:', error?.message);
      return `
--- ข้อมูลเมนูแนะนำประจำร้านตำครกซิ่ง ---
- ส้มตำปูปลาร้าแซ่บซิ่ง (60 บาท)
- ส้มตำไทยไข่เค็ม (65 บาท)
- ส้มตำซั่วปูปลาร้า (65 บาท)
- คอหมูย่างเตาถ่านกระทะร้อน (95 บาท)
- ไก่ย่างเขาสวนกวางครึ่งตัว (120 บาท) / เต็มตัว (220 บาท)
- ต้มแซ่บกระดูกหมูอ่อน (110 บาท)
- ลาบหมู / น้ำตกคอหมูย่าง (85 บาท)
- ข้าวเหนียวเขี้ยวงู (15 บาท), แคบหมูกรอบ (20 บาท)
`;
    }
  }

  /**
   * สร้าง System Prompt ประจำตัวน้องส้มตำ AI ร้านตำครกซิ่ง
   */
  private buildSystemInstruction(liveContext: string): string {
    return `
คุณคือ "น้องส้มตำ AI" ผู้ช่วยอัจฉริยะประจำร้านอาหาร "ตำครกซิ่ง" (Tum Krok Zing Restaurant)
ร้านตำครกซิ่งเป็นร้านอาหารอีสานและส้มตำรสเด็ดชื่อดัง มีเอกลักษณ์คือรสแซ่บ จัดจ้าน วัตถุดิบสดใหม่ ปลาร้าต้มสุกหอมนัว

[บุคลิกและลักษณะการพูดคุย]
- เป็นมิตร สดใส ร่าเริง สุภาพ และมีเสน่ห์แบบสาวอีสานน่ารัก
- ใช้คำลงท้ายน่ารักและสุภาพ เช่น "จ้า", "นะคะ", "ค่ะ", "เด้อจ้า"
- ให้ความช่วยเหลือลูกค้าอย่างกระตือรือร้นในการเลือกเมนู แนะนำระดับความเผ็ด แนะนำโปรโมชั่น และขั้นตอนการสั่งอาหาร

[ข้อมูลสำคัญของร้านตำครกซิ่ง]
- เวลาเปิด-ปิด: เปิดให้บริการทุกวัน เวลา 10:00 น. - 21:30 น. (ครัวปิดรับออเดอร์สุดท้าย 21:00 น.)
- ระดับความเผ็ดที่ลูกค้าสั่งได้:
  1. ไม่เผ็ด (ไม่ใส่พริกเลย เหมาะสำหรับเด็กหรือคนไม่ทานเผ็ด)
  2. เผ็ดน้อย (พริก 1-2 เม็ด)
  3. เผ็ดกลาง (พริก 3-5 เม็ด กำลังอร่อยกลมกล่อม)
  4. เผ็ดซิ่งสะเดิด (พริก 10 เม็ดขึ้นไป แซ่บไฟลุก!)
- ปลาร้า: ใช้น้ำปลาร้าต้มสุกสูตรเฉพาะของร้าน สะอาด ถูกหลักอนามัย หรือลูกค้าสามารถระบุ "ไม่ใส่ปลาร้า" ได้
- การสั่งอาหารและชำระเงิน: ลูกค้าสามารถกดเลือกเมนูใส่ตะกร้าในระบบเว็บแอพนี้ได้ทันที ระบุเบอร์โต๊ะ (หากนั่งทานที่ร้าน) หรือเลือกแบบกลับบ้าน (Take Away) ชำระเงินได้ผ่านสแกน QR PromptPay หรือบัตรเครดิต

[ข้อมูลเมนูและโปรโมชั่นจริงในระบบ]
${liveContext}

[กฎเหล็กและขอบเขตการตอบคำถาม]
1. คุณต้องตอบเฉพาะเรื่องที่เกี่ยวกับร้านอาหาร "ตำครกซิ่ง", เมนูอาหาร, ราคา, โปรโมชั่น, เวลาเปิด-ปิด, สถานที่ตั้ง และบริการของร้านเท่านั้น
2. หากลูกค้าถามเรื่องนอกเหนือจากร้านอาหาร (เช่น เรื่องการเมือง, ดารา, การบ้าน, เรื่องส่วนตัว, หรือเรื่องอื่นๆ ที่ไม่เกี่ยวกับร้านตำครกซิ่ง) ให้ปฏิเสธอย่างสุภาพทันที โดยใช้ประโยคแนวทาง เช่น "ขออภัยด้วยนะคะ น้องส้มตำ AI เป็นผู้ช่วยประจำร้านตำครกซิ่ง สามารถให้ข้อมูลได้เฉพาะเรื่องเมนูอาหารและบริการของร้านเราเท่านั้นค่ะ มีเมนูไหนสนใจสอบถามเพิ่มไหมคะ? 🌶️"
3. ตอบเป็นภาษาไทยที่อ่านง่าย สละสลวย กระชับ ไม่ยืดยาวเกินไป
4. ปิดท้ายด้วยคำเชิญชวนน่ารัก เช่น "รับเมนูไหนเพิ่มให้จดลงออเดอร์ดีคะ?", "อยากแซ่บแบบไหนสั่งน้องส้มตำ AI ได้เลยเด้อจ้า!"
`.trim();
  }

  /**
   * รับข้อความจากลูกค้า ส่งให้ Gemini API ประมวลผล และส่งคำตอบกลับ
   */
  async ask(dto: AskChatbotDto): Promise<ChatbotReplyDto> {
    const userMessage = dto.message?.trim();
    if (!userMessage) {
      return {
        reply: 'ขออภัยจ้า น้องส้มตำ AI ไม่ได้รับข้อความคำถามเลย ลองพิมพ์ใหม่อีกครั้งนะคะ 🙏',
        timestamp: new Date().toISOString(),
      };
    }

    // หากยังไม่ได้ตั้งค่า API Key หรือ Client ไม่พร้อม
    const apiKey = process.env.GEMINI_API_KEY;
    if (!this.aiClient || !apiKey || apiKey === 'your_gemini_api_key_here') {
      return this.handleFallbackReply(userMessage);
    }

    try {
      // 1. ดึง Context สดของร้าน
      const liveContext = await this.getRestaurantLiveContext();
      const systemInstruction = this.buildSystemInstruction(liveContext);

      // 2. เตรียม Contents สำหรับ Multi-turn Conversation
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      if (dto.history && Array.isArray(dto.history)) {
        for (const item of dto.history) {
          if (item.text && item.role) {
            contents.push({
              role: item.role === ChatRole.USER ? 'user' : 'model',
              parts: [{ text: item.text }],
            });
          }
        }
      }

      // 3. เพิ่มข้อความปัจจุบันของ User พร้อมระบุข้อมูลโต๊ะถ้ามี
      let finalUserPrompt = userMessage;
      if (dto.tableNumber) {
        finalUserPrompt = `[ลูกค้ากำลังนั่งอยู่ที่โต๊ะหมายเลข: ${dto.tableNumber}]\n${userMessage}`;
      }

      contents.push({
        role: 'user',
        parts: [{ text: finalUserPrompt }],
      });

      // 4. เรียกใช้งาน Gemini API ผ่าน SDK @google/genai
      const response = await this.aiClient.models.generateContent({
        model: this.modelName,
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
        },
      });

      const replyText =
        response.text ||
        'น้องส้มตำ AIได้รับคำถามแล้วจ้า เมนูร้านตำครกซิ่งอร่อยทุกเมนูเลย สนใจสั่งเมนูไหนเป็นพิเศษไหมคะ? 😊';

      return {
        reply: replyText,
        suggestedQuestions: this.generateDynamicSuggestions(userMessage),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('เกิดข้อผิดพลาดในการเรียก Gemini API:', error);

      if (error?.message?.includes('API_KEY_INVALID') || error?.status === 400) {
        return {
          reply:
            '⚠️ ดูเหมือนว่าคีย์ GEMINI_API_KEY ในระบบไม่ถูกต้อง กรุณาตรวจสอบการตั้งค่าในไฟล์ .env จ้า',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        reply:
          'ขออภัยหลายๆ เด้อจ้า พอดีระบบเครือข่ายน้องส้มตำ AI ขัดข้องชั่วคราว แต่ร้านตำครกซิ่งยังเปิดรับออเดอร์ความแซ่บอยู่นะคะ สามารถเลือกเมนูในหน้าเว็บได้เลยจ้า! 🌶️',
        suggestedQuestions: [
          'เมนูขายดีแนะนำ',
          'ร้านเปิดกี่โมง?',
          'มีโปรค่าจัดส่งไหม?',
        ],
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * รายการคำถามแนะนำเริ่มต้นสำหรับลูกค้าบนหน้าต่างแชท (ให้ตรงกับปุ่มหน้าเว็บ)
   */
  getSuggestedQuestions(): string[] {
    return [
      'เมนูขายดีแนะนำ',
      'ร้านเปิดกี่โมง?',
      'มีโปรค่าจัดส่งไหม?',
      'ร้านตั้งอยู่ที่ไหน?',
    ];
  }

  /**
   * สร้างปุ่มคำถามแนะนำต่อเนื่องตามบริบทของคำถามล่าสุด
   */
  private generateDynamicSuggestions(userMessage: string): string[] {
    const msg = userMessage.toLowerCase();
    if (msg.includes('โปร') || msg.includes('ส่วนลด') || msg.includes('จัดส่ง')) {
      return ['เมนูขายดีแนะนำ', 'ร้านเปิดกี่โมง?', 'ร้านตั้งอยู่ที่ไหน?'];
    }
    if (msg.includes('เผ็ด') || msg.includes('พริก')) {
      return ['เมนูขายดีแนะนำ', 'ร้านเปิดกี่โมง?'];
    }
    if (msg.includes('ตำ') || msg.includes('เมนู')) {
      return ['ร้านเปิดกี่โมง?', 'มีโปรค่าจัดส่งไหม?', 'ร้านตั้งอยู่ที่ไหน?'];
    }
    return [
      'เมนูขายดีแนะนำ',
      'ร้านเปิดกี่โมง?',
      'มีโปรค่าจัดส่งไหม?',
    ];
  }

  /**
   * Fallback ตอบกลับจำลองกรณีผู้พัฒนายังไม่ได้ใส่ GEMINI_API_KEY
   */
  private handleFallbackReply(userMessage: string): ChatbotReplyDto {
    const msg = userMessage.toLowerCase();
    let reply =
      'ยินดีต้อนรับสู่ร้านตำครกซิ่งจ้า! 🌶️ (ขณะนี้ระบบกำลังทำงานในโหมดออฟไลน์)\n\n';

    if (msg.includes('เมนู') || msg.includes('แนะนำ')) {
      reply +=
        'เมนูแนะนำสุดแซ่บประจำร้านเรา:\n' +
        '1. ส้มตำปูปลาร้าแซ่บซิ่ง (60 บาท) - รสจัดจ้าน ปลาร้านัวต้มสุกสะอาด\n' +
        '2. ตำไทยไข่เค็ม (65 บาท) - กลมกล่อม หวานเปรี้ยว ไข่เค็มชิ้นโต\n' +
        '3. คอหมูย่างเตาถ่าน (95 บาท) - หมูนุ่มฉ่ำ ทานคู่กับน้ำจิ้มแจ่วรสเด็ด\n' +
        '4. ไก่ย่างเขาสวนกวาง (120 บาท) - หนังกรอบเนื้อนุ่ม หอมสมุนไพร\n' +
        '5. ต้มแซ่บกระดูกอ่อน (110 บาท) - ซดร้อนๆ โล่งคอแซ่บถึงใจ!';
    } else if (msg.includes('เวลา') || msg.includes('เปิด') || msg.includes('ปิด')) {
      reply += 'ร้านตำครกซิ่งเปิดบริการทุกวัน เวลา 10:00 - 21:30 น. (ครัวปิด 21:00 น.) จ้า';
    } else if (msg.includes('โปร') || msg.includes('ส่วนลด') || msg.includes('จัดส่ง')) {
      reply += 'ทางร้านมีโปรโมชั่นสั่งครบ 300 บาท ส่งฟรีในละแวกใกล้เคียงจ้า! หรือสามารถตรวจสอบโค้ดส่วนลดได้ที่หน้าโปรโมชั่นเลยค่ะ';
    } else if (msg.includes('ที่อยู่') || msg.includes('ตั้งอยู่') || msg.includes('ร้านอยู่ที่ไหน')) {
      reply += 'ร้านตำครกซิ่งตั้งอยู่ใจกลางเมือง เดินทางสะดวก หรือสามารถสั่งผ่านระบบเดลิเวอรีบนหน้าเว็บไซต์นี้ได้เลยจ้า!';
    } else {
      reply +=
        'ขออภัยด้วยนะคะ น้องส้มตำ AI เป็นผู้ช่วยประจำร้านตำครกซิ่ง สามารถให้ข้อมูลได้เฉพาะเรื่องเมนูอาหารและบริการของร้านเราเท่านั้นค่ะ มีเมนูไหนสนใจสอบถามเพิ่มไหมคะ? 🌶️';
    }

    return {
      reply,
      suggestedQuestions: this.getSuggestedQuestions().slice(0, 3),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * ตรวจสอบสถานะความพร้อมของระบบแชทบอท
   */
  checkHealth() {
    const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');
    return {
      status: 'ok',
      service: 'Tum Krok Zing Chatbot Service',
      geminiConfigured: hasKey,
      model: this.modelName,
      message: hasKey
        ? 'Gemini AI API Key พร้อมใช้งาน'
        : 'ยังไม่ได้ระบุ GEMINI_API_KEY ในไฟล์ .env (ระบบกำลังใช้ Fallback Mode)',
    };
  }
}