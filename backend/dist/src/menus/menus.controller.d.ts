import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
export declare class MenusController {
    private readonly menusService;
    constructor(menusService: MenusService);
    create(createMenuDto: CreateMenuDto): Promise<{
        category: {
            category_name: string;
            category_id: number;
        };
    } & {
        menu_id: number;
        menu_name: string;
        category_id: number;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        image_url: string | null;
        calories: number | null;
        is_available: boolean;
    }>;
    findAll(categoryId?: string, isAvailable?: string): Promise<({
        category: {
            category_name: string;
            category_id: number;
        };
        allergens: ({
            allergen: {
                allergen_id: number;
                allergen_name: string;
                icon_url: string | null;
            };
        } & {
            menu_id: number;
            allergen_id: number;
        })[];
    } & {
        menu_id: number;
        menu_name: string;
        category_id: number;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        image_url: string | null;
        calories: number | null;
        is_available: boolean;
    })[]>;
    findOne(id: number): Promise<{
        category: {
            category_name: string;
            category_id: number;
        };
        allergens: ({
            allergen: {
                allergen_id: number;
                allergen_name: string;
                icon_url: string | null;
            };
        } & {
            menu_id: number;
            allergen_id: number;
        })[];
        ingredients: ({
            ingredient: {
                name: string;
                created_at: Date;
                ingredient_id: number;
                quantity: number;
                unit: string;
                min_quantity: number;
                updated_at: Date;
            };
        } & {
            menu_id: number;
            ingredient_id: number;
            quantity_used: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        menu_id: number;
        menu_name: string;
        category_id: number;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        image_url: string | null;
        calories: number | null;
        is_available: boolean;
    }>;
    update(id: number, updateMenuDto: UpdateMenuDto): Promise<{
        category: {
            category_name: string;
            category_id: number;
        };
    } & {
        menu_id: number;
        menu_name: string;
        category_id: number;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        image_url: string | null;
        calories: number | null;
        is_available: boolean;
    }>;
    remove(id: number): Promise<{
        menu_id: number;
        menu_name: string;
        category_id: number;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        image_url: string | null;
        calories: number | null;
        is_available: boolean;
    }>;
}
