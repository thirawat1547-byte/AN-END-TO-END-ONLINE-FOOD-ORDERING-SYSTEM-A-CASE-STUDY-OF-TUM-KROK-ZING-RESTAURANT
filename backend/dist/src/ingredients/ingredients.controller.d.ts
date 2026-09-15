import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
export declare class IngredientsController {
    private readonly ingredientsService;
    constructor(ingredientsService: IngredientsService);
    findAll(): Promise<{
        name: string;
        created_at: Date;
        updated_at: Date;
        quantity: number;
        ingredient_id: number;
        unit: string;
        min_quantity: number;
    }[]>;
    findOne(id: number): Promise<{
        name: string;
        created_at: Date;
        updated_at: Date;
        quantity: number;
        ingredient_id: number;
        unit: string;
        min_quantity: number;
    }>;
    create(createDto: CreateIngredientDto): Promise<{
        name: string;
        created_at: Date;
        updated_at: Date;
        quantity: number;
        ingredient_id: number;
        unit: string;
        min_quantity: number;
    }>;
    update(id: number, updateDto: UpdateIngredientDto): Promise<{
        name: string;
        created_at: Date;
        updated_at: Date;
        quantity: number;
        ingredient_id: number;
        unit: string;
        min_quantity: number;
    }>;
    remove(id: number): Promise<{
        name: string;
        created_at: Date;
        updated_at: Date;
        quantity: number;
        ingredient_id: number;
        unit: string;
        min_quantity: number;
    }>;
}
