import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
export declare class IngredientsService implements OnModuleInit {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    translateAllToThai(): Promise<{
        name: string;
        ingredient_id: number;
        quantity: import("@prisma/client/runtime/library").Decimal;
        unit: string;
        min_quantity: import("@prisma/client/runtime/library").Decimal;
        updated_at: Date;
    }[]>;
    findAll(): Promise<{
        name: string;
        ingredient_id: number;
        quantity: import("@prisma/client/runtime/library").Decimal;
        unit: string;
        min_quantity: import("@prisma/client/runtime/library").Decimal;
        updated_at: Date;
    }[]>;
    findOne(ingredient_id: number): Promise<{
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
    update(ingredient_id: number, updateDto: UpdateIngredientDto): Promise<{
        name: string;
        ingredient_id: number;
        quantity: import("@prisma/client/runtime/library").Decimal;
        unit: string;
        min_quantity: import("@prisma/client/runtime/library").Decimal;
        updated_at: Date;
    }>;
    remove(ingredient_id: number): Promise<{
        name: string;
        ingredient_id: number;
        quantity: import("@prisma/client/runtime/library").Decimal;
        unit: string;
        min_quantity: import("@prisma/client/runtime/library").Decimal;
        updated_at: Date;
    }>;
}
