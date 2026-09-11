import { PrismaService } from '../prisma.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
export declare class IngredientsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        name: string;
        created_at: Date;
        updated_at: Date;
        quantity: number;
        ingredient_id: number;
        unit: string;
        min_quantity: number;
    }[]>;
    findOne(ingredient_id: number): Promise<{
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
    update(ingredient_id: number, updateDto: UpdateIngredientDto): Promise<{
        name: string;
        created_at: Date;
        updated_at: Date;
        quantity: number;
        ingredient_id: number;
        unit: string;
        min_quantity: number;
    }>;
    remove(ingredient_id: number): Promise<{
        name: string;
        created_at: Date;
        updated_at: Date;
        quantity: number;
        ingredient_id: number;
        unit: string;
        min_quantity: number;
    }>;
}
