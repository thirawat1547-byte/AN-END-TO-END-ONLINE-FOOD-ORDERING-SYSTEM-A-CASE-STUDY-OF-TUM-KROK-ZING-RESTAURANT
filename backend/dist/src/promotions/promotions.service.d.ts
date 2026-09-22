import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
export declare class PromotionsService implements OnModuleInit {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    private ensureUserClaimedPromotionsTable;
    private seedDefaultPromotionsIfEmpty;
    findAll(): Promise<{
        promo_id: number;
        created_at: Date;
        code: string;
        discount_type: string;
        discount_value: import("@prisma/client/runtime/library").Decimal;
        min_order_price: import("@prisma/client/runtime/library").Decimal;
        expiry_date: Date;
    }[]>;
    findActive(): Promise<{
        promo_id: number;
        created_at: Date;
        code: string;
        discount_type: string;
        discount_value: import("@prisma/client/runtime/library").Decimal;
        min_order_price: import("@prisma/client/runtime/library").Decimal;
        expiry_date: Date;
    }[]>;
    findOne(promo_id: number): Promise<{
        promo_id: number;
        created_at: Date;
        code: string;
        discount_type: string;
        discount_value: import("@prisma/client/runtime/library").Decimal;
        min_order_price: import("@prisma/client/runtime/library").Decimal;
        expiry_date: Date;
    }>;
    findByCode(code: string): Promise<{
        promo_id: number;
        created_at: Date;
        code: string;
        discount_type: string;
        discount_value: import("@prisma/client/runtime/library").Decimal;
        min_order_price: import("@prisma/client/runtime/library").Decimal;
        expiry_date: Date;
    }>;
    claimPromotion(userId: number, promoId: number): Promise<{
        success: boolean;
        message: string;
        promo_id: number;
        code: string;
    }>;
    getMyPromotions(userId: number): Promise<{
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
    create(createDto: CreatePromotionDto): Promise<{
        promo_id: number;
        created_at: Date;
        code: string;
        discount_type: string;
        discount_value: import("@prisma/client/runtime/library").Decimal;
        min_order_price: import("@prisma/client/runtime/library").Decimal;
        expiry_date: Date;
    }>;
    update(promo_id: number, updateDto: UpdatePromotionDto): Promise<{
        promo_id: number;
        created_at: Date;
        code: string;
        discount_type: string;
        discount_value: import("@prisma/client/runtime/library").Decimal;
        min_order_price: import("@prisma/client/runtime/library").Decimal;
        expiry_date: Date;
    }>;
    remove(promo_id: number): Promise<{
        promo_id: number;
        created_at: Date;
        code: string;
        discount_type: string;
        discount_value: import("@prisma/client/runtime/library").Decimal;
        min_order_price: import("@prisma/client/runtime/library").Decimal;
        expiry_date: Date;
    }>;
}
