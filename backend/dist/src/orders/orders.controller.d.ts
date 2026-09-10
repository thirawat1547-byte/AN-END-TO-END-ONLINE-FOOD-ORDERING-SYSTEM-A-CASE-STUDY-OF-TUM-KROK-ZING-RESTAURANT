import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(createOrderDto: CreateOrderDto): Promise<{
        table: {
            table_id: number;
            table_number: string;
            capacity: number;
            status: string;
        };
        order_items: ({
            menu: {
                description: string | null;
                menu_name: string;
                price: import("@prisma/client/runtime/library").Decimal;
                image_url: string | null;
                calories: number | null;
                is_available: boolean;
                menu_id: number;
                category_id: number;
            };
        } & {
            menu_id: number;
            created_at: Date;
            order_id: number;
            quantity: number;
            unit_price: number;
            order_item_id: number;
        })[];
    } & {
        user_id: number | null;
        table_id: number | null;
        status: string;
        order_type: string;
        total_price: import("@prisma/client/runtime/library").Decimal;
        created_at: Date;
        order_id: number;
        promo_id: number | null;
    }>;
    findAll(status?: string, tableId?: string): Promise<({
        table: {
            table_id: number;
            table_number: string;
            capacity: number;
            status: string;
        };
        order_items: ({
            menu: {
                description: string | null;
                menu_name: string;
                price: import("@prisma/client/runtime/library").Decimal;
                image_url: string | null;
                calories: number | null;
                is_available: boolean;
                menu_id: number;
                category_id: number;
            };
        } & {
            menu_id: number;
            created_at: Date;
            order_id: number;
            quantity: number;
            unit_price: number;
            order_item_id: number;
        })[];
    } & {
        user_id: number | null;
        table_id: number | null;
        status: string;
        order_type: string;
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
            table_number: string;
            capacity: number;
            status: string;
        };
        order_items: ({
            menu: {
                description: string | null;
                menu_name: string;
                price: import("@prisma/client/runtime/library").Decimal;
                image_url: string | null;
                calories: number | null;
                is_available: boolean;
                menu_id: number;
                category_id: number;
            };
        } & {
            menu_id: number;
            created_at: Date;
            order_id: number;
            quantity: number;
            unit_price: number;
            order_item_id: number;
        })[];
    } & {
        user_id: number | null;
        table_id: number | null;
        status: string;
        order_type: string;
        total_price: import("@prisma/client/runtime/library").Decimal;
        created_at: Date;
        order_id: number;
        promo_id: number | null;
    }>;
    updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto): Promise<{
        user_id: number | null;
        table_id: number | null;
        status: string;
        order_type: string;
        total_price: import("@prisma/client/runtime/library").Decimal;
        created_at: Date;
        order_id: number;
        promo_id: number | null;
    }>;
}
