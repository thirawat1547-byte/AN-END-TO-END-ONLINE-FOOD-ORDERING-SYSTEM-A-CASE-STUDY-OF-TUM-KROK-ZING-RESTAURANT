import { PrismaService } from '../prisma.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
export declare class IngredientsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        created_at: Date;
        name: string;
        ingredient_id: number;
        quantity: number;
        unit: string;
        min_quantity: number;
        updated_at: Date;
    }[]>;
    findOne(ingredient_id: number): Promise<{
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
    update(ingredient_id: number, updateDto: UpdateIngredientDto): Promise<{
        created_at: Date;
        name: string;
        ingredient_id: number;
        quantity: number;
        unit: string;
        min_quantity: number;
        updated_at: Date;
    }>;
    remove(ingredient_id: number): Promise<{
        created_at: Date;
        name: string;
        ingredient_id: number;
        quantity: number;
        unit: string;
        min_quantity: number;
        updated_at: Date;
    }>;
}
