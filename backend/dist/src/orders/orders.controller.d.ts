import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(createOrderDto: CreateOrderDto): Promise<{
        table: {
            status: string;
            table_id: number;
            table_number: string;
            capacity: number;
        };
        order_items: ({
            menu: {
                menu_id: number;
                category_id: number;
                menu_name: string;
                description: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                image_url: string | null;
                calories: number | null;
                is_available: boolean;
            };
        } & {
            order_id: number;
            quantity: number;
            customization: import("@prisma/client/runtime/library").JsonValue | null;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            order_item_id: number;
            menu_id: number;
        })[];
    } & {
        order_type: string;
        status: string;
        total_price: import("@prisma/client/runtime/library").Decimal;
        created_at: Date;
        order_id: number;
        user_id: number | null;
        table_id: number | null;
        promo_id: number | null;
    }>;
    findAll(status?: string, tableId?: string): Promise<({
        table: {
            status: string;
            table_id: number;
            table_number: string;
            capacity: number;
        };
        order_items: ({
            menu: {
                menu_id: number;
                category_id: number;
                menu_name: string;
                description: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                image_url: string | null;
                calories: number | null;
                is_available: boolean;
            };
        } & {
            order_id: number;
            quantity: number;
            customization: import("@prisma/client/runtime/library").JsonValue | null;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            order_item_id: number;
            menu_id: number;
        })[];
    } & {
        order_type: string;
        status: string;
        total_price: import("@prisma/client/runtime/library").Decimal;
        created_at: Date;
        order_id: number;
        user_id: number | null;
        table_id: number | null;
        promo_id: number | null;
    })[]>;
    findOne(id: number): Promise<{
        user: {
            user_id: number;
            username: string;
            phone_number: string;
        };
        table: {
            status: string;
            table_id: number;
            table_number: string;
            capacity: number;
        };
        order_items: ({
            menu: {
                menu_id: number;
                category_id: number;
                menu_name: string;
                description: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                image_url: string | null;
                calories: number | null;
                is_available: boolean;
            };
        } & {
            order_id: number;
            quantity: number;
            customization: import("@prisma/client/runtime/library").JsonValue | null;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            order_item_id: number;
            menu_id: number;
        })[];
    } & {
        order_type: string;
        status: string;
        total_price: import("@prisma/client/runtime/library").Decimal;
        created_at: Date;
        order_id: number;
        user_id: number | null;
        table_id: number | null;
        promo_id: number | null;
    }>;
    updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto): Promise<{
        order_type: string;
        status: string;
        total_price: import("@prisma/client/runtime/library").Decimal;
        created_at: Date;
        order_id: number;
        user_id: number | null;
        table_id: number | null;
        promo_id: number | null;
    }>;
}
