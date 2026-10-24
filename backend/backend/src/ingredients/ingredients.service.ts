import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';

@Injectable()
export class IngredientsService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. ดูรายการวัตถุดิบทั้งหมด (เรียงตามลำดับที่เหลือน้อยสุดก่อน เพื่อให้ห้องครัวเห็นของใกล้หมด)
  async findAll() {
    return this.prisma.ingredient.findMany({
      orderBy: { quantity: 'asc' },
    });
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