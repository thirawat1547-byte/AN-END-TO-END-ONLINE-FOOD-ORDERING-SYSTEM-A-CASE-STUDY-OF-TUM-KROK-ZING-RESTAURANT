import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
export declare class IngredientsController {
    private readonly ingredientsService;
    constructor(ingredientsService: IngredientsService);
    findAll(): Promise<{
        name: string;
        ingredient_id: number;
        quantity: import("@prisma/client/runtime/library").Decimal;
        unit: string;
        min_quantity: import("@prisma/client/runtime/library").Decimal;
        updated_at: Date;
    }[]>;
    translateAllToThai(): Promise<{
        name: string;
        ingredient_id: number;
        quantity: import("@prisma/client/runtime/library").Decimal;
        unit: string;
        min_quantity: import("@prisma/client/runtime/library").Decimal;
        updated_at: Date;
    }[]>;
    findOne(id: number): Promise<{
        name: string;
        ingredient_id: number;
        quantity: import("@prisma/client/runtime/library").Decimal;
        unit: string;
        min_quantity: import("@prisma/client/runtime/library").Decimal;
        updated_at: Date;
    }>;
    create(createDto: CreateIngredientDto): Promise<{
        name: string;
        ingredient_id: number;
        quantity: import("@prisma/client/runtime/library").Decimal;
        unit: string;
        min_quantity: import("@prisma/client/runtime/library").Decimal;
        updated_at: Date;
    }>;
    update(id: number, updateDto: UpdateIngredientDto): Promise<{
        name: string;
        ingredient_id: number;
        quantity: import("@prisma/client/runtime/library").Decimal;
        unit: string;
        min_quantity: import("@prisma/client/runtime/library").Decimal;
        updated_at: Date;
    }>;
    remove(id: number): Promise<{
        name: string;
        ingredient_id: number;
        quantity: import("@prisma/client/runtime/library").Decimal;
        unit: string;
        min_quantity: import("@prisma/client/runtime/library").Decimal;
        updated_at: Date;
    }>;
}
