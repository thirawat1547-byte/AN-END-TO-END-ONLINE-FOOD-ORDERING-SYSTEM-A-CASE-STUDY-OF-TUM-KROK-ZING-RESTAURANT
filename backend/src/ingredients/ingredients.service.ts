import { Injectable, NotFoundException, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';

// พจนานุกรมแปลชื่อวัตถุดิบและหน่วยนับจากภาษาอังกฤษเป็นภาษาไทย
const INGREDIENT_DICT: Array<{ regex: RegExp; thaiName: string; thaiUnit: string }> = [
  { regex: /salted\s*crab/i, thaiName: 'ปูเค็ม / ปูดอง', thaiUnit: 'ตัว' },
  { regex: /bottled\s*water|water\s*bottle|mineral\s*water/i, thaiName: 'น้ำดื่มขวด', thaiUnit: 'ขวด' },
  { regex: /coke\s*can|coca\s*cola\s*can|coke/i, thaiName: 'โค้กกระป๋อง', thaiUnit: 'กระป๋อง' },
  { regex: /sprite/i, thaiName: 'สไปรท์กระป๋อง', thaiUnit: 'กระป๋อง' },
  { regex: /egg/i, thaiName: 'ไข่ไก่สด', thaiUnit: 'ฟอง' },
  { regex: /lime|lemon/i, thaiName: 'มะนาวสด', thaiUnit: 'ลูก' },
  { regex: /pandan/i, thaiName: 'ใบเตยสด', thaiUnit: 'กรัม' },
  { regex: /pepper\s*powder|ground\s*pepper/i, thaiName: 'พริกไทยป่น', thaiUnit: 'กรัม' },
  { regex: /black\s*pepper/i, thaiName: 'พริกไทยดำป่น', thaiUnit: 'กรัม' },
  { regex: /white\s*pepper/i, thaiName: 'พริกไทยขาวป่น', thaiUnit: 'กรัม' },
  { regex: /holy\s*basil/i, thaiName: 'ใบกะเพราสด', thaiUnit: 'กรัม' },
  { regex: /sweet\s*basil|basil/i, thaiName: 'ใบโหระพาสด', thaiUnit: 'กรัม' },
  { regex: /chicken\s*seasoning|seasoning\s*powder/i, thaiName: 'ผงปรุงรสไก่', thaiUnit: 'กรัม' },
  { regex: /roasted\s*rice|ground\s*rice/i, thaiName: 'ข้าวคั่ว', thaiUnit: 'กรัม' },
  { regex: /minced\s*pork|ground\s*pork/i, thaiName: 'หมูสับสด', thaiUnit: 'กก.' },
  { regex: /crispy\s*pork/i, thaiName: 'หมูกรอบ', thaiUnit: 'กก.' },
  { regex: /pork\s*belly/i, thaiName: 'หมูสามชั้น', thaiUnit: 'กก.' },
  { regex: /pork/i, thaiName: 'เนื้อหมูสด', thaiUnit: 'กก.' },
  { regex: /chicken\s*wing/i, thaiName: 'ปีกไก่สด', thaiUnit: 'กก.' },
  { regex: /chicken\s*thigh/i, thaiName: 'สะโพกไก่สด', thaiUnit: 'กก.' },
  { regex: /chicken\s*breast/i, thaiName: 'อกไก่สด', thaiUnit: 'กก.' },
  { regex: /chicken/i, thaiName: 'เนื้อไก่สด', thaiUnit: 'กก.' },
  { regex: /shrimp|prawn/i, thaiName: 'กุ้งสด', thaiUnit: 'กก.' },
  { regex: /squid|calamari/i, thaiName: 'ปลาหมึกสด', thaiUnit: 'กก.' },
  { regex: /seafood/i, thaiName: 'อาหารทะเลรวม', thaiUnit: 'กก.' },
  { regex: /fish/i, thaiName: 'เนื้อปลาสด', thaiUnit: 'กก.' },
  { regex: /beef/i, thaiName: 'เนื้อวัวสด', thaiUnit: 'กก.' },
  { regex: /raw\s*papaya|green\s*papaya|papaya/i, thaiName: 'มะละกอดิบขูด', thaiUnit: 'กก.' },
  { regex: /red\s*chili|chili|chilli/i, thaiName: 'พริกสดจินดาแดง', thaiUnit: 'กก.' },
  { regex: /garlic/i, thaiName: 'กระเทียมสด', thaiUnit: 'กก.' },
  { regex: /chinese\s*kale|kale/i, thaiName: 'ผักคะน้าสด', thaiUnit: 'กก.' },
  { regex: /tomato/i, thaiName: 'มะเขือเทศสีดา', thaiUnit: 'กก.' },
  { regex: /long\s*bean|yardlong/i, thaiName: 'ถั่วฝักยาว', thaiUnit: 'กก.' },
  { regex: /shallot/i, thaiName: 'หอมแดง', thaiUnit: 'กก.' },
  { regex: /spring\s*onion|scallion/i, thaiName: 'ต้นหอม', thaiUnit: 'กก.' },
  { regex: /coriander|cilantro/i, thaiName: 'ผักชี', thaiUnit: 'กก.' },
  { regex: /culantro/i, thaiName: 'ผักชีฝรั่ง', thaiUnit: 'กก.' },
  { regex: /mint|peppermint/i, thaiName: 'ใบสะระแหน่', thaiUnit: 'กก.' },
  { regex: /morning\s*glory/i, thaiName: 'ผักบุ้ง', thaiUnit: 'กก.' },
  { regex: /cucumber/i, thaiName: 'แตงกวา', thaiUnit: 'กก.' },
  { regex: /fermented\s*fish|plara/i, thaiName: 'น้ำปลาร้าปรุงสุก', thaiUnit: 'ขวด' },
  { regex: /fish\s*sauce/i, thaiName: 'น้ำปลาแท้', thaiUnit: 'ขวด' },
  { regex: /oyster\s*sauce/i, thaiName: 'ซอสหอยนางรม', thaiUnit: 'ขวด' },
  { regex: /soy\s*sauce/i, thaiName: 'ซีอิ๊วขาว', thaiUnit: 'ขวด' },
  { regex: /palm\s*sugar/i, thaiName: 'น้ำตาลปี๊บ', thaiUnit: 'กก.' },
  { regex: /sugar/i, thaiName: 'น้ำตาลทราย', thaiUnit: 'กก.' },
  { regex: /msg|monosodium/i, thaiName: 'ผงชูรส', thaiUnit: 'กรัม' },
  { regex: /cooking\s*oil|vegetable\s*oil|oil/i, thaiName: 'น้ำมันพืช', thaiUnit: 'ขวด' },
  { regex: /jasmine\s*rice|rice/i, thaiName: 'ข้าวสารหอมมะลิ', thaiUnit: 'กก.' },
  { regex: /sticky\s*rice|glutinous\s*rice/i, thaiName: 'ข้าวเหนียว', thaiUnit: 'กก.' },
  { regex: /glass\s*noodles|vermicelli/i, thaiName: 'วุ้นเส้น', thaiUnit: 'ห่อ' },
  { regex: /peanut/i, thaiName: 'ถั่วลิสงคั่วบด', thaiUnit: 'กก.' },
  { regex: /dried\s*shrimp/i, thaiName: 'กุ้งแห้ง', thaiUnit: 'กก.' },
  { regex: /red\s*curry\s*paste|curry\s*paste/i, thaiName: 'พริกแกงเผ็ด', thaiUnit: 'กก.' },
];

const UNIT_MAP: Record<string, string> = {
  pcs: 'ชิ้น',
  piece: 'ชิ้น',
  pieces: 'ชิ้น',
  bottle: 'ขวด',
  bottles: 'ขวด',
  can: 'กระป๋อง',
  cans: 'กระป๋อง',
  g: 'กรัม',
  gram: 'กรัม',
  grams: 'กรัม',
  kg: 'กก.',
  kilogram: 'กก.',
  kilograms: 'กก.',
  pack: 'ห่อ',
  packs: 'ห่อ',
  packet: 'ซอง',
  bag: 'ถุง',
  bags: 'ถุง',
  box: 'กล่อง',
  boxes: 'กล่อง',
  ml: 'มล.',
  l: 'ลิตร',
  liter: 'ลิตร',
};

@Injectable()
export class IngredientsService implements OnModuleInit {
  private readonly logger = new Logger(IngredientsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    // แปลงข้อมูลภาษาอังกฤษในฐานข้อมูลให้เป็นภาษาไทยโดยอัตโนมัติตั้งแต่เริ่มต้นระบบ
    try {
      await this.translateAllToThai();
    } catch (err) {
      this.logger.warn(`Could not auto-translate ingredients on init: ${err.message}`);
    }
  }

  // แปลงชื่อและหน่วยนับในฐานข้อมูลทั้งหมดเป็นภาษาไทย
  async translateAllToThai() {
    const items = await this.prisma.ingredient.findMany();
    let updatedCount = 0;

    for (const item of items) {
      let newName = item.name;
      let newUnit = item.unit;

      for (const entry of INGREDIENT_DICT) {
        if (entry.regex.test(item.name)) {
          newName = entry.thaiName;
          if (entry.thaiUnit) {
            newUnit = entry.thaiUnit;
          }
          break;
        }
      }

      const cleanUnit = (newUnit || '').toLowerCase().trim();
      if (UNIT_MAP[cleanUnit]) {
        newUnit = UNIT_MAP[cleanUnit];
      }

      if (newName !== item.name || newUnit !== item.unit) {
        await this.prisma.ingredient.update({
          where: { ingredient_id: item.ingredient_id },
          data: {
            name: newName,
            unit: newUnit,
          },
        });
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      this.logger.log(`✅ แปลงชื่อวัตถุดิบและหน่วยนับเป็นภาษาไทยในฐานข้อมูลสำเร็จ: ${updatedCount} รายการ`);
    }

    return this.prisma.ingredient.findMany({
      orderBy: { quantity: 'asc' },
    });
  }

  // 1. ดูรายการวัตถุดิบทั้งหมด
  async findAll() {
    const items = await this.prisma.ingredient.findMany({
      orderBy: { quantity: 'asc' },
    });

    // หากยังมีรายการที่ชื่อเป็นภาษาอังกฤษ ให้แปลงและบันทึกลงฐานข้อมูลจริงทันที
    const hasEnglish = items.some((i) => /[a-zA-Z]/.test(i.name) || /[a-zA-Z]/.test(i.unit));
    if (hasEnglish) {
      return this.translateAllToThai();
    }

    return items;
  }

  // 2. ดูรายละเอียดวัตถุดิบรายตัว
  async findOne(ingredient_id: number) {
    const item = await this.prisma.ingredient.findUnique({
      where: { ingredient_id },
    });
    if (!item) {
      throw new NotFoundException(`ไม่พบวัตถุดิบรหัส ID #${ingredient_id}`);
    }
    return item;
  }

  // 3. เพิ่มวัตถุดิบใหม่เข้าระบบ
  async create(createDto: CreateIngredientDto) {
    return this.prisma.ingredient.create({
      data: {
        name: createDto.name,
        quantity: createDto.quantity,
        unit: createDto.unit,
        min_quantity: createDto.min_quantity ?? 5,
      },
    });
  }

  // 4. อัปเดตข้อมูลหรือปรับจำนวนสต็อก
  async update(ingredient_id: number, updateDto: UpdateIngredientDto) {
    await this.findOne(ingredient_id);

    return this.prisma.ingredient.update({
      where: { ingredient_id },
      data: updateDto,
    });
  }

  // 5. ลบวัตถุดิบ
  async remove(ingredient_id: number) {
    await this.findOne(ingredient_id);

    return this.prisma.ingredient.delete({
      where: { ingredient_id },
    });
  }
}