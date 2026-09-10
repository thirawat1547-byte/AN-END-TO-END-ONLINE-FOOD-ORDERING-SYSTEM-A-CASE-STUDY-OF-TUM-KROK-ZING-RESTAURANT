import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
export declare class PromotionsController {
    private readonly promotionsService;
    constructor(promotionsService: PromotionsService);
    findAll(): Promise<{
        promo_id: number;
        code: string;
        discount_type: string;
        discount_value: import("@prisma/client/runtime/library").Decimal;
        min_order_price: import("@prisma/client/runtime/library").Decimal;
        expiry_date: Date;
    }[]>;
    findActive(): Promise<{
        promo_id: number;
        code: string;
        discount_type: string;
        discount_value: import("@prisma/client/runtime/library").Decimal;
        min_order_price: import("@prisma/client/runtime/library").Decimal;
        expiry_date: Date;
    }[]>;
    findByCode(code: string): Promise<{
        promo_id: number;
        code: string;
        discount_type: string;
        discount_value: import("@prisma/client/runtime/library").Decimal;
        min_order_price: import("@prisma/client/runtime/library").Decimal;
        expiry_date: Date;
    }>;
    findOne(id: number): Promise<{
        promo_id: number;
        code: string;
        discount_type: string;
        discount_value: import("@prisma/client/runtime/library").Decimal;
        min_order_price: import("@prisma/client/runtime/library").Decimal;
        expiry_date: Date;
    }>;
    create(createDto: CreatePromotionDto): Promise<{
        promo_id: number;
        code: string;
        discount_type: string;
        discount_value: import("@prisma/client/runtime/library").Decimal;
        min_order_price: import("@prisma/client/runtime/library").Decimal;
        expiry_date: Date;
    }>;
    update(id: number, updateDto: UpdatePromotionDto): Promise<{
        promo_id: number;
        code: string;
        discount_type: string;
        discount_value: import("@prisma/client/runtime/library").Decimal;
        min_order_price: import("@prisma/client/runtime/library").Decimal;
        expiry_date: Date;
    }>;
    remove(id: number): Promise<{
        promo_id: number;
        code: string;
        discount_type: string;
        discount_value: import("@prisma/client/runtime/library").Decimal;
        min_order_price: import("@prisma/client/runtime/library").Decimal;
        expiry_date: Date;
    }>;
}
