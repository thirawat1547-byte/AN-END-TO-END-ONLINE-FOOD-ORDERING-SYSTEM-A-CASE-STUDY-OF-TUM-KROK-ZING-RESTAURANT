import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { OrdersGateway } from '../orders/orders.gateway';

@Injectable()
export class MenusService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersGateway: OrdersGateway,
  ) {}

  // 1. เพิ่มเมนูอาหารใหม่
  async create(createMenuDto: CreateMenuDto) {
    const { allergen_ids, ...menuData } = createMenuDto;
    const menu = await this.prisma.menu.create({
      data: menuData,
      include: { category: true },
    });

    if (allergen_ids && allergen_ids.length > 0) {
      await this.prisma.menuAllergen.createMany({
        data: allergen_ids.map((aId) => ({
          menu_id: menu.menu_id,
          allergen_id: Number(aId),
        })),
        skipDuplicates: true,
      });
    }

    const fullMenu = await this.findOne(menu.menu_id);
    this.ordersGateway.sendMenuUpdated(fullMenu);
    return fullMenu;
  }

  // ดึงรายการสารก่อภูมิแพ้ทั้งหมด
  async getAllergens() {
    try {
      await this.prisma.allergen.updateMany({
        where: { allergen_name: { contains: 'สัตว์น้ำมีเปลือก' } },
        data: { allergen_name: 'ปู' },
      });
    } catch (e) {
      // ignore
    }

    let allergens = await this.prisma.allergen.findMany({
      orderBy: { allergen_id: 'asc' },
    });
    if (!allergens || allergens.length === 0) {
      const defaultAllergens = [
        { allergen_id: 1, allergen_name: 'กุ้ง / อาหารทะเล', icon_url: '🦐' },
        { allergen_id: 2, allergen_name: 'ถั่วลิสง', icon_url: '🥜' },
        { allergen_id: 3, allergen_name: 'นม / ผลิตภัณฑ์นม', icon_url: '🥛' },
        { allergen_id: 4, allergen_name: 'กลูเตน / แป้งสาลี', icon_url: '🌾' },
        { allergen_id: 5, allergen_name: 'ไข่', icon_url: '🥚' },
        { allergen_id: 6, allergen_name: 'ปลาหมึก', icon_url: '🦑' },
        { allergen_id: 7, allergen_name: 'ปู', icon_url: '🦀' },
        { allergen_id: 8, allergen_name: 'ถั่วเหลือง / ซอสถั่วเหลือง', icon_url: '🫘' },
        { allergen_id: 9, allergen_name: 'ปลา / น้ำปลา / ปลาร้า', icon_url: '🐟' },
      ];
      try {
        await this.prisma.allergen.createMany({
          data: defaultAllergens,
          skipDuplicates: true,
        });
        allergens = await this.prisma.allergen.findMany({
          orderBy: { allergen_id: 'asc' },
        });
      } catch (e) {
        // fallback
      }
    }
    return allergens;
  }

  private static hasCheckedDefaults = false;

  // ดึงรายการสารก่อภูมิแพ้เริ่มต้นและบันทึกลง MENU_ALLERGENS หากยังไม่เคยมีการตั้งค่า
  private async ensureDefaultMenuAllergens() {
    if (MenusService.hasCheckedDefaults) return;
    MenusService.hasCheckedDefaults = true;
    try {
      const count = await this.prisma.menuAllergen.count();
      if (count === 0) {
        const allMenus = await this.prisma.menu.findMany();
        const initialLinks: { menu_id: number; allergen_id: number }[] = [];
        for (const m of allMenus) {
          const name = m.menu_name || '';
          const ids: number[] = [];
          if (name.includes('ทะเล') || name.includes('กุ้ง')) ids.push(1, 6);
          if (name.includes('ส้มตำปู') || name.includes('ปลาร้า')) ids.push(7, 9);
          if (name.includes('ส้มตำไทย')) ids.push(1, 2);
          if (name.includes('ไข่เจียว') || name.includes('ข้าวผัด')) ids.push(5);
          if (name.includes('ไก่ทอด')) ids.push(4);

          const uniqueIds = Array.from(new Set(ids));
          for (const aId of uniqueIds) {
            initialLinks.push({ menu_id: m.menu_id, allergen_id: aId });
          }
        }
        if (initialLinks.length > 0) {
          await this.prisma.menuAllergen.createMany({
            data: initialLinks,
            skipDuplicates: true,
          });
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // 2. ดึงรายการอาหารทั้งหมด (กรองตามหมวดหมู่ / สถานะขาย) พร้อมสูตรวัตถุดิบ
  async findAll(categoryId?: number, isAvailable?: boolean) {
    await this.ensureDefaultMenuAllergens();

    const menus = await this.prisma.menu.findMany({
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

    const seen = new Set<string>();
    const uniqueMenus: typeof menus = [];
    for (const m of menus) {
      let canonical = (m.menu_name || '').trim();
      if (canonical === 'ไข่เจียวหมูสับ') canonical = 'ข้าวไข่เจียวหมูสับ';
      if (canonical === 'ไข่เจียวกุ้ง') canonical = 'ข้าวไข่เจียวกุ้ง';
      if (canonical === 'ปีกไก่ทอด') canonical = 'ไก่ทอด (ปีก)';

      if (!seen.has(canonical)) {
        seen.add(canonical);
        uniqueMenus.push({
          ...m,
          menu_name: canonical,
        });
      }
    }

    return uniqueMenus.map((m) => {
      const filteredAllergens = (m.allergens || []).filter((a) => a.allergen != null);
      return {
        ...m,
        allergens: filteredAllergens,
        allergen_ids: filteredAllergens.map((a) => a.allergen_id),
        ingredients: (m.ingredients || []).filter((i) => i.ingredient != null),
      };
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

    const filteredAllergens = (menu.allergens || []).filter((a) => a.allergen != null);
    return {
      ...menu,
      allergens: filteredAllergens,
      allergen_ids: filteredAllergens.map((a) => a.allergen_id),
      ingredients: (menu.ingredients || []).filter((i) => i.ingredient != null),
    };
  }

  // 4. แก้ไขข้อมูลเมนูอาหาร
  async update(id: number, updateMenuDto: UpdateMenuDto) {
    await this.findOne(id);
    const { allergen_ids, ...menuData } = updateMenuDto;

    if (Object.keys(menuData).length > 0) {
      await this.prisma.menu.update({
        where: { menu_id: id },
        data: menuData,
      });
    }

    if (allergen_ids !== undefined) {
      await this.prisma.menuAllergen.deleteMany({
        where: { menu_id: id },
      });
      if (allergen_ids.length > 0) {
        await this.prisma.menuAllergen.createMany({
          data: allergen_ids.map((aId) => ({
            menu_id: id,
            allergen_id: Number(aId),
          })),
          skipDuplicates: true,
        });
      }
    }

    const fullMenu = await this.findOne(id);
    this.ordersGateway.sendMenuUpdated(fullMenu);
    return fullMenu;
  }

  // 5. ลบเมนูอาหาร
  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.menuIngredient.deleteMany({
      where: { menu_id: id },
    });
    await this.prisma.menuAllergen.deleteMany({
      where: { menu_id: id },
    });
    try {
      return await this.prisma.menu.delete({
        where: { menu_id: id },
      });
    } catch (err) {
      // หากเมนูนี้เคยมีประวัติการสั่งซื้อใน ORDER_ITEMS แล้ว ให้ปิดสถานะการขายแทนเพื่อรักษาความถูกต้องของข้อมูลใบเสร็จ
      return await this.prisma.menu.update({
        where: { menu_id: id },
        data: { is_available: false },
      });
    }
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