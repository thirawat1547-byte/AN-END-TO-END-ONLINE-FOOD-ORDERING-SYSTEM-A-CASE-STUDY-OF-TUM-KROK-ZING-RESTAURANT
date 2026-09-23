"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenusService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let MenusService = class MenusService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createMenuDto) {
        return this.prisma.menu.create({
            data: createMenuDto,
            include: { category: true },
        });
    }
    async findAll(categoryId, isAvailable) {
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
        const seen = new Set();
        const uniqueMenus = [];
        for (const m of menus) {
            let canonical = (m.menu_name || '').trim();
            if (canonical === 'ไข่เจียวหมูสับ')
                canonical = 'ข้าวไข่เจียวหมูสับ';
            if (canonical === 'ไข่เจียวกุ้ง')
                canonical = 'ข้าวไข่เจียวกุ้ง';
            if (canonical === 'ปีกไก่ทอด')
                canonical = 'ไก่ทอด (ปีก)';
            if (!seen.has(canonical)) {
                seen.add(canonical);
                uniqueMenus.push({
                    ...m,
                    menu_name: canonical,
                });
            }
        }
        return uniqueMenus.map((m) => ({
            ...m,
            allergens: (m.allergens || []).filter((a) => a.allergen != null),
            ingredients: (m.ingredients || []).filter((i) => i.ingredient != null),
        }));
    }
    async findOne(id) {
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
            throw new common_1.NotFoundException(`ไม่พบเมนูอาหารรหัส ${id}`);
        }
        return {
            ...menu,
            allergens: (menu.allergens || []).filter((a) => a.allergen != null),
            ingredients: (menu.ingredients || []).filter((i) => i.ingredient != null),
        };
    }
    async update(id, updateMenuDto) {
        await this.findOne(id);
        return this.prisma.menu.update({
            where: { menu_id: id },
            data: updateMenuDto,
            include: { category: true },
        });
    }
    async remove(id) {
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
        }
        catch (err) {
            return await this.prisma.menu.update({
                where: { menu_id: id },
                data: { is_available: false },
            });
        }
    }
    async updateIngredients(menuId, ingredients) {
        await this.findOne(menuId);
        await this.prisma.menuIngredient.deleteMany({
            where: { menu_id: menuId },
        });
        if (ingredients && ingredients.length > 0) {
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
};
exports.MenusService = MenusService;
exports.MenusService = MenusService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MenusService);
//# sourceMappingURL=menus.service.js.map