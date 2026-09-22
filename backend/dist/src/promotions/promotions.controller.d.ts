import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
export declare class PromotionsController {
    private readonly promotionsService;
    constructor(promotionsService: PromotionsService);
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
    getMyPromotions(user: any): Promise<{
        claim_id: number;
        promo_id: number;
        is_used: boolean;
        claimed_at: any;
        used_at: any;
        code: any;
        discount_type: any;
        discount_value: number;
        min_order_price: number;
        expiry_date: any;
        is_expired: boolean;
    }[]>;
    claimPromotion(id: number, user: any): Promise<{
        success: boolean;
        message: string;
        promo_id: number;
        code: string;
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
    findOne(id: number): Promise<{
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
    update(id: number, updateDto: UpdatePromotionDto): Promise<{
        created_at: Date;
        promo_id: number;
        code: string;
        discount_type: string;
        discount_value: import("@prisma/client/runtime/library").Decimal;
        min_order_price: import("@prisma/client/runtime/library").Decimal;
        expiry_date: Date;
    }>;
    remove(id: number): Promise<{
        created_at: Date;
        promo_id: number;
        code: string;
        discount_type: string;
        discount_value: import("@prisma/client/runtime/library").Decimal;
        min_order_price: import("@prisma/client/runtime/library").Decimal;
        expiry_date: Date;
    }>;
}
