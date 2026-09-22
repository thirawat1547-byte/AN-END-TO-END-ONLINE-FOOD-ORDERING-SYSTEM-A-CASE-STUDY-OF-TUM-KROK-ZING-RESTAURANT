import { PrismaService } from '../prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
export declare class OrdersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createOrderDto: CreateOrderDto): Promise<{
        table_id: number | null;
        user_id: number | null;
        order_type: string;
        status: string;
        total_price: import("@prisma/client/runtime/library").Decimal;
        created_at: Date;
        order_id: number;
        promo_id: number | null;
    }>;
    findAll(status?: string, tableId?: number): Promise<({
        table: {
            table_id: number;
            status: string;
            table_number: string;
            capacity: number;
        };
        order_items: ({
            menu: {
                description: string | null;
                menu_id: number;
                category_id: number;
                menu_name: string;
                price: import("@prisma/client/runtime/library").Decimal;
                image_url: string | null;
                calories: number | null;
                is_available: boolean;
            };
        } & {
            menu_id: number;
            quantity: number;
            order_id: number;
            customization: import("@prisma/client/runtime/library").JsonValue | null;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            order_item_id: number;
        })[];
    } & {
        table_id: number | null;
        user_id: number | null;
        order_type: string;
        status: string;
        total_price: import("@prisma/client/runtime/library").Decimal;
        created_at: Date;
        order_id: number;
        promo_id: number | null;
    })[]>;
    findOne(id: number): Promise<{
        user: {
            user_id: number;
            username: string;
            phone_number: string;
        };
        table: {
            table_id: number;
            status: string;
            table_number: string;
            capacity: number;
        };
        order_items: ({
            menu: {
                description: string | null;
                menu_id: number;
                category_id: number;
                menu_name: string;
                price: import("@prisma/client/runtime/library").Decimal;
                image_url: string | null;
                calories: number | null;
                is_available: boolean;
            };
        } & {
            menu_id: number;
            quantity: number;
            order_id: number;
            customization: import("@prisma/client/runtime/library").JsonValue | null;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            order_item_id: number;
        })[];
    } & {
        table_id: number | null;
        user_id: number | null;
        order_type: string;
        status: string;
        total_price: import("@prisma/client/runtime/library").Decimal;
        created_at: Date;
        order_id: number;
        promo_id: number | null;
    }>;
    updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto): Promise<{
        table_id: number | null;
        user_id: number | null;
        order_type: string;
        status: string;
        total_price: import("@prisma/client/runtime/library").Decimal;
        created_at: Date;
        order_id: number;
        promo_id: number | null;
    }>;
}
