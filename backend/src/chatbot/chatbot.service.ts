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
    this.modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    if (apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.trim() !== '') {
      try {
        this.aiClient = new GoogleGenAI({ apiKey });
        this.logger.log(`เชื่อมต่อ Google Gemini API สำเร็จ (โมเดล: ${this.modelName})`);
      } catch (err) {
        this.logger.error('ไม่สามารถสร้างอินสแตนซ์ GoogleGenAI ได้:', err);
      }
    } else {
      this.logger.warn(
        'ยังไม่ได้ตั้งค่า GEMINI_API_KEY ในไฟล์ .env — แชทบอทจะทำงานในโหมดจำลอง (Fallback Mode)',
      );
    }
  }

  private async getRestaurantLiveContext(): Promise<string> {
    try {
      const [menus, promotions, storeSetting] = await Promise.all([
        this.prisma.menu.findMany({
          where: { is_available: true },
          select: {
            menu_id: true,
            menu_name: true,
            price: true,
            description: true,
            category: { select: { category_name: true } },
            allergens: {
              select: {
                allergen: {
                  select: { allergen_name: true },
                },
              },
            },
          },
          take: 50,
        }),
        this.prisma.promotion.findMany({
          where: { expiry_date: { gte: new Date() } },
          select: {
            code: true,
            discount_type: true,
            discount_value: true,
            min_order_price: true,
          },
        }),
        this.prisma.storeSetting.findFirst().catch(() => null),
      ]);

      let contextText = '\n--- ข้อมูลทั่วไปของร้าน ---\n';
      if (storeSetting) {
        contextText += `- ชื่อร้าน: ${storeSetting.store_name}\n`;
        contextText += `- สโลแกน: ${storeSetting.tagline || 'แซ่บซิ่ง จัดจ้าน วัตถุดิบสดใหม่'}\n`;
        contextText += `- ที่อยู่: ${storeSetting.address || '123/45 ถนนสุขุมวิท แขวงคลองเตย กรุงเทพฯ 10210'}\n`;
        contextText += `- เบอร์โทรศัพท์: ${storeSetting.phone || '02-987-6543, 081-234-5678'}\n`;
        contextText += `- เวลาเปิด-ปิด: ${storeSetting.open_time || '10:00'} - ${storeSetting.close_time || '21:30'} น. (สถานะ: ${storeSetting.is_open ? 'เปิดให้บริการ' : 'ปิดชั่วคราว'})\n`;
        contextText += `- ค่าจัดส่งเริ่มต้น: ${Number(storeSetting.base_delivery_fee || 20)} บาท (เพิ่ม ${Number(storeSetting.delivery_fee_per_km || 10)} บาท/กม.)\n`;
        contextText += `- ชำระเงิน: PromptPay ${storeSetting.promptpay_number || '081-234-5678'} (${storeSetting.promptpay_name || 'บริษัทตำครกซิ่ง'}) หรือบัตรเครดิต\n`;
      } else {
        contextText += `- ร้านตำครกซิ่ง เปิดให้บริการทุกวัน 10:00 - 21:30 น. เบอร์โทรศัพท์ 081-234-5678\n`;
      }

      contextText += '\n--- เมนูอาหารที่มีจำหน่ายในปัจจุบัน (พร้อมสารก่อภูมิแพ้) ---\n';
      if (menus.length > 0) {
        contextText += menus
          .map((m) => {
            const allergenNames = m.allergens
              ?.map((a) => a.allergen?.allergen_name)
              .filter(Boolean);
            const allergenStr =
              allergenNames && allergenNames.length > 0
                ? ` [มีสารก่อภูมิแพ้: ${allergenNames.join(', ')}]`
                : ' [ไม่มีสารก่อภูมิแพ้ระบุ]';
            return `- [ID: ${m.menu_id}] ${m.menu_name} (หมวด: ${m.category?.category_name || 'ไม่ระบุ'}) ราคา ${Number(m.price)} บาท${m.description ? ` (รายละเอียด: ${m.description})` : ''}${allergenStr}`;
          })
          .join('\n');
      } else {
        contextText += '- ส้มตำปูปลาร้าแซ่บซิ่ง (60 บาท), ตำไทยไข่เค็ม (65 บาท), คอหมูย่าง (95 บาท), ไก่ย่างเขาสวนกวาง (120 บาท), ต้มแซ่บกระดูกอ่อน (110 บาท), ข้าวเหนียว (15 บาท)\n';
      }

      contextText += '\n--- โปรโมชั่นและโค้ดส่วนลดที่ใช้ได้ปัจจุบัน ---\n';
      if (promotions.length > 0) {
        contextText += promotions
          .map(
            (p) =>
              `- โค้ด '${p.code}': ส่วนลด ${Number(p.discount_value)} ${p.discount_type === 'PERCENT' ? '%' : 'บาท'} (เมื่อสั่งขั้นต่ำ ${Number(p.min_order_price)} บาท)`,
          )
          .join('\n');
      } else {
        contextText += '- ไม่มีโปรโมชั่นพิเศษในขณะนี้\n';
      }

      return contextText;
    } catch (error) {
      this.logger.warn('ไม่สามารถดึงข้อมูลจากฐานข้อมูลได้:', error?.message);
      return `
--- ข้อมูลเมนูแนะนำ ---
- ส้มตำปูปลาร้าแซ่บซิ่ง (60 บาท)
- ส้มตำไทยไข่เค็ม (65 บาท)
- คอหมูย่างเตาถ่าน (95 บาท)
- ไก่ย่างเขาสวนกวาง (120 บาท)
- ต้มแซ่บกระดูกอ่อน (110 บาท)
- ข้าวเหนียว (15 บาท)
--- ข้อมูลทั่วไป ---
- เปิดทุกวัน 10:00 - 21:30 น.
- เบอร์โทร: 081-234-5678
- ชำระผ่าน PromptPay หรือบัตรเครดิต
`;
    }
  }

  private buildSystemInstruction(liveContext: string): string {
    return `
คุณคือ "น้องส้มตำ AI" ผู้ช่วยอัจฉริยะประจำร้านอาหาร "ตำครกซิ่ง" (Tum Krok Zing Restaurant)
ร้านตำครกซิ่งเป็นร้านอาหารอีสานและส้มตำรสเด็ดชื่อดัง มีเอกลักษณ์คือรสแซ่บ จัดจ้าน วัตถุดิบสดใหม่ ปลาร้าต้มสุกหอมนัว

[บุคลิกและลักษณะการพูดคุย]
- เป็นมิตร สดใส ร่าเริง สุภาพ และมีเสน่ห์แบบสาวอีสานน่ารัก
- ใช้คำลงท้ายน่ารักและสุภาพ เช่น "จ้า", "นะคะ", "ค่ะ", "เด้อจ้า"
- ให้ความช่วยเหลือลูกค้าอย่างกระตือรือร้น

[ข้อมูลสำคัญของร้านตำครกซิ่ง]
- เวลาเปิด-ปิด: เปิดทุกวัน 10:00 - 21:30 น. (ครัวปิดสุดท้าย 21:00 น.)
- ระดับความเผ็ด: 1.ไม่เผ็ด 2.เผ็ดน้อย (1-2 เม็ด) 3.เผ็ดกลาง (3-5 เม็ด) 4.เผ็ดซิ่งสะเดิด (10+ เม็ด)
- ปลาร้า: ต้มสุกสะอาด หรือระบุ "ไม่ใส่ปลาร้า" ได้
- การชำระ: QR PromptPay หรือบัตรเครดิต
- สารก่อภูมิแพ้: สามารถให้ข้อมูลสารก่อภูมิแพ้ของแต่ละเมนูตามที่มีระบุไว้ในข้อมูลเมนูได้ เช่น กุ้ง/อาหารทะเล, ถั่วลิสง, นม, กลูเตน/แป้งสาลี, ไข่ หากลูกค้าถามเรื่องสารก่อภูมิแพ้ ให้ระบุเมนูที่มีสารก่อภูมิแพ้นั้นอย่างชัดเจนและเตือนด้วยความห่วงใย

[ข้อมูลเมนู โปรโมชั่น และข้อมูลร้านปัจจุบันจากระบบ]
${liveContext}

[กฎเหล็ก — ห้ามละเมิดโดยเด็ดขาด]
1. ตอบเฉพาะเรื่องที่เกี่ยวกับร้านตำครกซิ่งเท่านั้น ได้แก่ เมนู ราคา สารก่อภูมิแพ้ โปรโมชั่น เวลา ที่อยู่ การสั่งอาหาร และบริการของร้าน
2. หากถามเรื่องนอกเหนือจากร้าน (การเมือง ดารา การบ้าน คณิตศาสตร์ ฯลฯ) ให้ปฏิเสธสุภาพว่า "ขออภัยด้วยนะคะ น้องส้มตำ AI ช่วยได้แค่เรื่องเมนูและบริการของร้านตำครกซิ่งเท่านั้นค่ะ มีเมนูไหนสนใจไหมคะ? 🌶️"
3. ตอบภาษาไทยที่อ่านง่าย กระชับ น่ารัก
4. ปิดท้ายด้วยคำเชิญชวนน่ารักเสมอ
`.trim();
  }

  async ask(dto: AskChatbotDto): Promise<ChatbotReplyDto> {
    const userMessage = dto.message?.trim();
    if (!userMessage) {
      return {
        reply: 'ขออภัยจ้า ไม่ได้รับข้อความ ลองพิมพ์ใหม่อีกครั้งนะคะ 🙏',
        timestamp: new Date().toISOString(),
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!this.aiClient || !apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
      return await this.handleFallbackReply(userMessage);
    }

    try {
      const liveContext = await this.getRestaurantLiveContext();
      const systemInstruction = this.buildSystemInstruction(liveContext);

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

      let finalUserPrompt = userMessage;
      if (dto.tableNumber) {
        finalUserPrompt = `[ลูกค้านั่งที่โต๊ะ: ${dto.tableNumber}]\n${userMessage}`;
      }
      contents.push({ role: 'user', parts: [{ text: finalUserPrompt }] });

      const TIMEOUT_MS = 25000;

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('GEMINI_TIMEOUT')), TIMEOUT_MS),
      );

      const response = await Promise.race([
        this.aiClient.models.generateContent({
          model: this.modelName,
          contents: contents,
          config: { systemInstruction: systemInstruction },
        }),
        timeoutPromise,
      ]);

      const replyText =
        response.text ||
        'น้องส้มตำ AI รับคำถามแล้วจ้า สนใจสั่งเมนูไหนไหมคะ? 😊';

      return {
        reply: replyText,
        suggestedQuestions: this.generateDynamicSuggestions(userMessage),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('เกิดข้อผิดพลาดในการเรียก Gemini API:', error);

      if (
        error?.message?.includes('API_KEY_INVALID') ||
        error?.message?.includes('API key not valid') ||
        error?.status === 400
      ) {
        return {
          reply: 'GEMINI_API_KEY ไม่ถูกต้อง กรุณาตรวจสอบในไฟล์ .env จ้า',
          timestamp: new Date().toISOString(),
        };
      }

      // 503 หรือ timeout หรือ 429 quota — ตอบ fallback จาก DB ทันที
      const isUnavailable =
        error?.message?.includes('503') ||
        error?.message?.includes('429') ||
        error?.message?.includes('UNAVAILABLE') ||
        error?.message?.includes('high demand') ||
        error?.message?.includes('quota');

      if (isUnavailable) {
        this.logger.warn(`Gemini API ไม่พร้อมใช้งาน (${error?.message?.slice(0, 50)}) — ใช้ DB fallback ทันที`);
        return await this.handleFallbackReply(userMessage);
      }

      return await this.handleFallbackReply(userMessage);
    }
  }

  getSuggestedQuestions(): string[] {
    return [
      'เมนูขายดีแนะนำ',
      'ร้านเปิดกี่โมง?',
      'มีโปรค่าจัดส่งไหม?',
      'ร้านตั้งอยู่ที่ไหน?',
    ];
  }

  private generateDynamicSuggestions(userMessage: string): string[] {
    const msg = userMessage.toLowerCase();
    if (msg.includes('โปร') || msg.includes('ส่วนลด') || msg.includes('จัดส่ง')) {
      return ['เมนูขายดีแนะนำ', 'ร้านเปิดกี่โมง?', 'ร้านตั้งอยู่ที่ไหน?'];
    }
    if (msg.includes('เผ็ด') || msg.includes('พริก')) {
      return ['เมนูขายดีแนะนำ', 'ร้านเปิดกี่โมง?', 'มีโปรค่าจัดส่งไหม?'];
    }
    if (msg.includes('ตำ') || msg.includes('เมนู') || msg.includes('แนะนำ')) {
      return ['ร้านเปิดกี่โมง?', 'มีโปรค่าจัดส่งไหม?', 'ร้านตั้งอยู่ที่ไหน?'];
    }
    if (msg.includes('เปิด') || msg.includes('เวลา') || msg.includes('ปิด')) {
      return ['เมนูขายดีแนะนำ', 'มีโปรค่าจัดส่งไหม?', 'ร้านตั้งอยู่ที่ไหน?'];
    }
    return ['เมนูขายดีแนะนำ', 'ร้านเปิดกี่โมง?', 'มีโปรค่าจัดส่งไหม?'];
  }

  private async handleFallbackReply(userMessage: string): Promise<ChatbotReplyDto> {
    const msg = userMessage.toLowerCase();

    try {
      // ---- คำถามเรื่องสารก่อภูมิแพ้ ----
      if (msg.includes('ภูมิแพ้') || msg.includes('แพ้') || msg.includes('allergen') || msg.includes('สารก่อ')) {
        const allergenData = await this.prisma.menuAllergen.findMany({
          include: {
            menu: { select: { menu_name: true, price: true, is_available: true } },
            allergen: { select: { allergen_name: true } },
          },
          where: { menu: { is_available: true } },
        });

        // จัดกลุ่มตาม allergen
        const grouped: Record<string, string[]> = {};
        for (const ma of allergenData) {
          if (!ma.allergen) continue;
          const key = ma.allergen.allergen_name;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(`${ma.menu.menu_name} (${Number(ma.menu.price)} บาท)`);
        }

        if (Object.keys(grouped).length === 0) {
          return { reply: 'ขณะนี้ยังไม่มีข้อมูลสารก่อภูมิแพ้ในระบบค่ะ กรุณาสอบถามพนักงานโดยตรงนะคะ 🙏', timestamp: new Date().toISOString() };
        }

        let reply = '🌶️ **เมนูที่มีสารก่อภูมิแพ้** ของร้านตำครกซิ่ง:\n\n';
        for (const [allergen, menus] of Object.entries(grouped)) {
          reply += `**🔸 ${allergen}:**\n`;
          menus.forEach(m => { reply += `  • ${m}\n`; });
          reply += '\n';
        }
        reply += '_หากมีอาการแพ้รุนแรง กรุณาแจ้งพนักงานก่อนสั่งอาหารนะคะ_ 🙏';

        return { reply, suggestedQuestions: ['เมนูขายดีแนะนำ', 'ร้านเปิดกี่โมง?', 'มีโปรค่าจัดส่งไหม?'], timestamp: new Date().toISOString() };
      }

      // ---- คำถามเรื่องเมนู/แนะนำ/ราคา ----
      if (msg.includes('เมนู') || msg.includes('แนะนำ') || msg.includes('ขายดี') || msg.includes('ราคา') || msg.includes('มีอะไร')) {
        const menus = await this.prisma.menu.findMany({
          where: { is_available: true },
          include: { category: true },
          orderBy: { menu_id: 'asc' },
          take: 20,
        });

        if (menus.length === 0) {
          return { reply: 'ขณะนี้ร้านยังไม่มีเมนูเปิดให้บริการค่ะ', timestamp: new Date().toISOString() };
        }

        // จัดกลุ่มตาม category
        const byCategory: Record<string, typeof menus> = {};
        for (const m of menus) {
          const cat = m.category?.category_name || 'อื่นๆ';
          if (!byCategory[cat]) byCategory[cat] = [];
          byCategory[cat].push(m);
        }

        let reply = '🌶️ **เมนูของร้านตำครกซิ่ง:**\n\n';
        for (const [cat, items] of Object.entries(byCategory)) {
          reply += `**📌 ${cat}:**\n`;
          items.slice(0, 5).forEach(m => {
            reply += `  • ${m.menu_name} — ${Number(m.price)} บาท`;
            if (m.calories) reply += ` (${m.calories} kcal)`;
            reply += '\n';
          });
          reply += '\n';
        }

        return { reply, suggestedQuestions: ['เมนูที่มีสารก่อภูมิแพ้', 'ร้านเปิดกี่โมง?', 'มีโปรค่าจัดส่งไหม?'], timestamp: new Date().toISOString() };
      }

      // ---- คำถามเรื่องโปรโมชั่น/ส่วนลด/จัดส่ง ----
      if (msg.includes('โปร') || msg.includes('ส่วนลด') || msg.includes('โค้ด') || msg.includes('จัดส่ง') || msg.includes('ค่าส่ง')) {
        const [promos, store] = await Promise.all([
          this.prisma.promotion.findMany({ where: { expiry_date: { gte: new Date() } }, take: 5 }),
          this.prisma.storeSetting.findUnique({ where: { id: 1 } }),
        ]);

        let reply = '🎉 **โปรโมชั่นและค่าจัดส่ง:**\n\n';
        if (promos.length > 0) {
          reply += '**โค้ดส่วนลดที่ใช้ได้ตอนนี้:**\n';
          promos.forEach(p => {
            const val = p.discount_type === 'PERCENTAGE' ? `${p.discount_value}%` : `${Number(p.discount_value)} บาท`;
            reply += `  • โค้ด **${p.code}** — ลด ${val} (ขั้นต่ำ ${Number(p.min_order_price)} บาท)\n`;
          });
          reply += '\n';
        }
        if (store) {
          reply += `**ค่าจัดส่ง:** เริ่มต้น ${Number(store.base_delivery_fee)} บาท + ${Number(store.delivery_fee_per_km)} บาท/กม.\n`;
          reply += `**สั่งขั้นต่ำ:** ${Number(store.min_order_delivery)} บาท\n`;
          reply += `**รัศมีจัดส่ง:** ไม่เกิน ${Number(store.max_delivery_km)} กม.`;
        }

        return { reply, suggestedQuestions: ['เมนูขายดีแนะนำ', 'ร้านเปิดกี่โมง?', 'เมนูที่มีสารก่อภูมิแพ้'], timestamp: new Date().toISOString() };
      }

      // ---- คำถามเรื่องเวลา/ที่อยู่ ----
      if (msg.includes('เปิด') || msg.includes('ปิด') || msg.includes('เวลา') || msg.includes('ที่อยู่') || msg.includes('อยู่ที่ไหน') || msg.includes('เบอร์') || msg.includes('ติดต่อ')) {
        const store = await this.prisma.storeSetting.findUnique({ where: { id: 1 } });
        if (store) {
          let reply = `🏪 **${store.store_name}**\n\n`;
          reply += `⏰ **เวลาเปิด:** ${store.open_time} - ${store.close_time} น.\n`;
          reply += `📍 **ที่อยู่:** ${store.address || 'กรุณาสอบถามพนักงาน'}\n`;
          reply += `📞 **โทร:** ${store.phone || '-'}\n`;
          reply += `💳 **PromptPay:** ${store.promptpay_number || '-'}`;
          return { reply, suggestedQuestions: ['เมนูขายดีแนะนำ', 'มีโปรค่าจัดส่งไหม?', 'เมนูที่มีสารก่อภูมิแพ้'], timestamp: new Date().toISOString() };
        }
      }
    } catch (e) {
      this.logger.warn('Fallback DB query failed:', e);
    }

    // default
    return {
      reply: 'ยินดีต้อนรับสู่ร้านตำครกซิ่งจ้า! 🌶️\n\nสามารถถามเรื่อง เมนู, ราคา, สารก่อภูมิแพ้, โปรโมชั่น, เวลาเปิด-ปิด หรือที่อยู่ร้านได้เลยนะคะ 😊',
      suggestedQuestions: this.getSuggestedQuestions().slice(0, 3),
      timestamp: new Date().toISOString(),
    };
  }

  checkHealth() {
    const apiKey = process.env.GEMINI_API_KEY;
    const hasKey = Boolean(apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.trim() !== '');
    return {
      status: 'ok',
      service: 'Tum Krok Zing Chatbot (น้องส้มตำ AI)',
      geminiConfigured: hasKey,
      model: this.modelName,
      aiClientReady: Boolean(this.aiClient),
      message: hasKey
        ? `Gemini AI พร้อมใช้งาน (โมเดล: ${this.modelName})`
        : 'ยังไม่ได้ระบุ GEMINI_API_KEY (Fallback Mode)',
    };
  }
}