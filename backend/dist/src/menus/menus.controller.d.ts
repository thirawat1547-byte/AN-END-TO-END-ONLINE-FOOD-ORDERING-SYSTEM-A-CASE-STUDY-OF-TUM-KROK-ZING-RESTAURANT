import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
export declare class MenusController {
    private readonly menusService;
    constructor(menusService: MenusService);
    create(createMenuDto: CreateMenuDto): Promise<{
        category: {
            category_id: number;
            category_name: string;
        };
    } & {
        description: string | null;
        menu_name: string;
        price: import("@prisma/client/runtime/library").Decimal;
        image_url: string | null;
        calories: number | null;
        is_available: boolean;
        menu_id: number;
        category_id: number;
    }>;
    findAll(categoryId?: string, isAvailable?: string): Promise<({
        category: {
            category_id: number;
            category_name: string;
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
        description: string | null;
        menu_name: string;
        price: import("@prisma/client/runtime/library").Decimal;
        image_url: string | null;
        calories: number | null;
        is_available: boolean;
        menu_id: number;
        category_id: number;
    })[]>;
    findOne(id: number): Promise<{
        category: {
            category_id: number;
            category_name: string;
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
                updated_at: Date;
                quantity: number;
                ingredient_id: number;
                unit: string;
                min_quantity: number;
            };
        } & {
            menu_id: number;
            ingredient_id: number;
            quantity_used: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        description: string | null;
        menu_name: string;
        price: import("@prisma/client/runtime/library").Decimal;
        image_url: string | null;
        calories: number | null;
        is_available: boolean;
        menu_id: number;
        category_id: number;
    }>;
    update(id: number, updateMenuDto: UpdateMenuDto): Promise<{
        category: {
            category_id: number;
            category_name: string;
        };
    } & {
        description: string | null;
        menu_name: string;
        price: import("@prisma/client/runtime/library").Decimal;
        image_url: string | null;
        calories: number | null;
        is_available: boolean;
        menu_id: number;
        category_id: number;
    }>;
    remove(id: number): Promise<{
        description: string | null;
        menu_name: string;
        price: import("@prisma/client/runtime/library").Decimal;
        image_url: string | null;
        calories: number | null;
        is_available: boolean;
        menu_id: number;
        category_id: number;
    }>;
}
