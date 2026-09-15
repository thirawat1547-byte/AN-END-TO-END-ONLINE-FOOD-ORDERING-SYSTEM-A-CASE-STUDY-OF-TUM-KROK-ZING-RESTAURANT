import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
export declare class IngredientsController {
    private readonly ingredientsService;
    constructor(ingredientsService: IngredientsService);
    findAll(): Promise<{
        created_at: Date;
        name: string;
        ingredient_id: number;
        quantity: number;
        unit: string;
        min_quantity: number;
        updated_at: Date;
    }[]>;
    findOne(id: number): Promise<{
        created_at: Date;
        name: string;
        ingredient_id: number;
        quantity: number;
        unit: string;
        min_quantity: number;
        updated_at: Date;
    }>;
    create(createDto: CreateIngredientDto): Promise<{
        created_at: Date;
        name: string;
        ingredient_id: number;
        quantity: number;
        unit: string;
        min_quantity: number;
        updated_at: Date;
    }>;
    update(id: number, updateDto: UpdateIngredientDto): Promise<{
        created_at: Date;
        name: string;
        ingredient_id: number;
        quantity: number;
        unit: string;
        min_quantity: number;
        updated_at: Date;
    }>;
    remove(id: number): Promise<{
        created_at: Date;
        name: string;
        ingredient_id: number;
        quantity: number;
        unit: string;
        min_quantity: number;
        updated_at: Date;
    }>;
}
