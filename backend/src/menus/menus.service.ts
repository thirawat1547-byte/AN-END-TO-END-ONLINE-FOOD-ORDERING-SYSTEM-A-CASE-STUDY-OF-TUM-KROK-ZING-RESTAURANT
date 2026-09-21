import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenusService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. เพิ่มเมนูอาหารใหม่
  async create(createMenuDto: CreateMenuDto) {
    return this.prisma.menu.create({
      data: createMenuDto,
      include: { category: true },
    });
  }

  // 2. ดึงรายการอาหารทั้งหมด (กรองตามหมวดหมู่ / สถานะขาย) พร้อมสูตรวัตถุดิบ
  async findAll(categoryId?: number, isAvailable?: boolean) {
    return this.prisma.menu.findMany({
      where: {
        ...(categoryId && { category_id: categoryId }),
        ...(isAvailable !== undefined && { is_available: isAvailable }),
      },
      include: {
        category: true,
        allergens: {
          include: { allergen: true },
        },
        ingredients: {
          include: { ingredient: true },
        },
      },
      orderBy: { menu_id: 'asc' },
    });
  }

  // 3. ดูรายละเอียดเมนูรายตัว
  async findOne(id: number) {
    const menu = await this.prisma.menu.findUnique({
      where: { menu_id: id },
      include: {
        category: true,
        ingredients: {
          include: { ingredient: true },
        },
        allergens: {
          include: { allergen: true },
        },
      },
    });

    if (!menu) {
      throw new NotFoundException(`ไม่พบเมนูอาหารรหัส ${id}`);
    }
    return menu;
  }

  // 4. แก้ไขข้อมูลเมนูอาหาร
  async update(id: number, updateMenuDto: UpdateMenuDto) {
    await this.findOne(id);
    return this.prisma.menu.update({
      where: { menu_id: id },
      data: updateMenuDto,
      include: { category: true },
    });
  }

  // 5. ลบเมนูอาหาร
  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.menu.delete({
      where: { menu_id: id },
    });
  }

  // 6. ผูกสูตร / แก้ไขสูตรอาหารและสัดส่วนวัตถุดิบ (Recipe Formulation)
  async updateIngredients(
    menuId: number,
    ingredients: Array<{ ingredient_id: number; quantity_used: number }>,
  ) {
    await this.findOne(menuId);

    // ลบสูตรเดิมออกก่อน
    await this.prisma.menuIngredient.deleteMany({
      where: { menu_id: menuId },
    });

    // เพิ่มสูตรใหม่ที่ระบุ
    if (ingredients && ingredients.length > 0) {
      // ป้องกันค่าซ้ำกันในรายการเดียวกัน
      const uniqueIngredients = [];
      const seen = new Set();
      for (const item of ingredients) {
        const ingId = Number(item.ingredient_id);
        const qty = Number(item.quantity_used);
        if (ingId && qty > 0 && !seen.has(ingId)) {
          seen.add(ingId);
          uniqueIngredients.push({
            menu_id: menuId,
            ingredient_id: ingId,
            quantity_used: qty,
          });
        }
      }

      if (uniqueIngredients.length > 0) {
        await this.prisma.menuIngredient.createMany({
          data: uniqueIngredients,
        });
      }
    }

    return this.findOne(menuId);
  }
}