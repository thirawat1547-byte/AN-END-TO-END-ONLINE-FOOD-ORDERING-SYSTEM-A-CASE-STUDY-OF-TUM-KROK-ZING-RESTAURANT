import { PrismaService } from '../prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
export declare class PromotionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        created_at: Date;
        promo_id: number;
        code: string;
        discount_type: string;
        discount_value: import("@prisma/client/runtime/library").Decimal;
        min_order_price: import("@prisma/client/runtime/library").Decimal;
        expiry_date: Date;
    }[]>;
    findActive(): Promise<{
        created_at: Date;
        promo_id: number;
        code: string;
        discount_type: string;
        discount_value: import("@prisma/client/runtime/library").Decimal;
        min_order_price: import("@prisma/client/runtime/library").Decimal;
        expiry_date: Date;
    }[]>;
    findOne(promo_id: number): Promise<{
        created_at: Date;
        promo_id: number;
        code: string;
        discount_type: string;
        discount_value: import("@prisma/client/runtime/library").Decimal;
        min_order_price: import("@prisma/client/runtime/library").Decimal;
        expiry_date: Date;
    }>;
    findByCode(code: string): Promise<{
        created_at: Date;
        promo_id: number;
        code: string;
        discount_type: string;
        discount_value: import("@prisma/client/runtime/library").Decimal;
        min_order_price: import("@prisma/client/runtime/library").Decimal;
        expiry_date: Date;
    }>;
    create(createDto: CreatePromotionDto): Promise<{
        created_at: Date;
        promo_id: number;
        code: string;
        discount_type: string;
        discount_value: import("@prisma/client/runtime/library").Decimal;
        min_order_price: import("@prisma/client/runtime/library").Decimal;
        expiry_date: Date;
    }>;
    update(promo_id: number, updateDto: UpdatePromotionDto): Promise<{
        created_at: Date;
        promo_id: number;
        code: string;
        discount_type: string;
        discount_value: import("@prisma/client/runtime/library").Decimal;
        min_order_price: import("@prisma/client/runtime/library").Decimal;
        expiry_date: Date;
    }>;
    remove(promo_id: number): Promise<{
        created_at: Date;
        promo_id: number;
        code: string;
        discount_type: string;
        discount_value: import("@prisma/client/runtime/library").Decimal;
        min_order_price: import("@prisma/client/runtime/library").Decimal;
        expiry_date: Date;
    }>;
}
