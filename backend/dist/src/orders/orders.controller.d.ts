import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(createOrderDto: CreateOrderDto, req: any): Promise<{
        table: {
            table_id: number;
            table_number: string;
            capacity: number;
            status: string;
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
            created_at: Date;
            quantity: number;
            order_id: number;
            order_item_id: number;
            menu_id: number;
            unit_price: number;
        })[];
    } & {
        promo_id: number | null;
        created_at: Date;
        table_id: number | null;
        status: string;
        order_id: number;
        user_id: number | null;
        order_type: string;
        total_price: import("@prisma/client/runtime/library").Decimal;
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
            created_at: Date;
            quantity: number;
            order_id: number;
            order_item_id: number;
            menu_id: number;
            unit_price: number;
        })[];
    } & {
        promo_id: number | null;
        created_at: Date;
        table_id: number | null;
        status: string;
        order_id: number;
        user_id: number | null;
        order_type: string;
        total_price: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    findMyOrders(req: any): Promise<({
        table: {
            table_id: number;
            table_number: string;
            capacity: number;
            status: string;
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
            created_at: Date;
            quantity: number;
            order_id: number;
            order_item_id: number;
            menu_id: number;
            unit_price: number;
        })[];
    } & {
        promo_id: number | null;
        created_at: Date;
        table_id: number | null;
        status: string;
        order_id: number;
        user_id: number | null;
        order_type: string;
        total_price: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    findOne(id: number): Promise<{
        table: {
            table_id: number;
            table_number: string;
            capacity: number;
            status: string;
        };
        user: {
            user_id: number;
            username: string;
            phone_number: string;
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
            created_at: Date;
            quantity: number;
            order_id: number;
            order_item_id: number;
            menu_id: number;
            unit_price: number;
        })[];
    } & {
        promo_id: number | null;
        created_at: Date;
        table_id: number | null;
        status: string;
        order_id: number;
        user_id: number | null;
        order_type: string;
        total_price: import("@prisma/client/runtime/library").Decimal;
    }>;
    updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto): Promise<{
        promo_id: number | null;
        created_at: Date;
        table_id: number | null;
        status: string;
        order_id: number;
        user_id: number | null;
        order_type: string;
        total_price: import("@prisma/client/runtime/library").Decimal;
    }>;
}
