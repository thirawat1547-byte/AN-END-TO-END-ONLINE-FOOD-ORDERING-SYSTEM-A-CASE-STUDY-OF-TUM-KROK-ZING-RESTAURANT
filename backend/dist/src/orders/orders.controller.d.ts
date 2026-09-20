import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(createOrderDto: CreateOrderDto, req: any): Promise<{
        table: {
            table_number: string;
            status: string;
            table_id: number;
            capacity: number;
        };
        order_items: ({
            menu: {
                menu_id: number;
                menu_name: string;
                category_id: number;
                description: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                image_url: string | null;
                calories: number | null;
                is_available: boolean;
            };
        } & {
            order_id: number;
            menu_id: number;
            created_at: Date;
            quantity: number;
            order_item_id: number;
            unit_price: number;
        })[];
    } & {
        order_id: number;
        total_price: import("@prisma/client/runtime/library").Decimal;
        status: string;
        promo_id: number | null;
        created_at: Date;
        table_id: number | null;
        user_id: number | null;
        order_type: string;
    }>;
    findAll(status?: string, tableId?: string, orderType?: string): Promise<({
        table: {
            table_number: string;
            status: string;
            table_id: number;
            capacity: number;
        };
        user: {
            user_id: number;
            username: string;
            email: string;
            phone_number: string;
            address: string;
        };
        transaction: {
            order_id: number;
            transaction_id: number;
            payment_method: string;
            payment_status: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            payment_slip_url: string | null;
        }[];
        order_items: ({
            menu: {
                menu_id: number;
                menu_name: string;
                category_id: number;
                description: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                image_url: string | null;
                calories: number | null;
                is_available: boolean;
            };
        } & {
            order_id: number;
            menu_id: number;
            created_at: Date;
            quantity: number;
            order_item_id: number;
            unit_price: number;
        })[];
    } & {
        order_id: number;
        total_price: import("@prisma/client/runtime/library").Decimal;
        status: string;
        promo_id: number | null;
        created_at: Date;
        table_id: number | null;
        user_id: number | null;
        order_type: string;
    })[]>;
    findMyOrders(req: any): Promise<({
        table: {
            table_number: string;
            status: string;
            table_id: number;
            capacity: number;
        };
        transaction: {
            order_id: number;
            transaction_id: number;
            payment_method: string;
            payment_status: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            payment_slip_url: string | null;
        }[];
        order_items: ({
            menu: {
                menu_id: number;
                menu_name: string;
                category_id: number;
                description: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                image_url: string | null;
                calories: number | null;
                is_available: boolean;
            };
        } & {
            order_id: number;
            menu_id: number;
            created_at: Date;
            quantity: number;
            order_item_id: number;
            unit_price: number;
        })[];
    } & {
        order_id: number;
        total_price: import("@prisma/client/runtime/library").Decimal;
        status: string;
        promo_id: number | null;
        created_at: Date;
        table_id: number | null;
        user_id: number | null;
        order_type: string;
    })[]>;
    findOne(id: number): Promise<{
        table: {
            table_number: string;
            status: string;
            table_id: number;
            capacity: number;
        };
        user: {
            user_id: number;
            username: string;
            phone_number: string;
            address: string;
        };
        transaction: {
            order_id: number;
            transaction_id: number;
            payment_method: string;
            payment_status: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            payment_slip_url: string | null;
        }[];
        order_items: ({
            menu: {
                menu_id: number;
                menu_name: string;
                category_id: number;
                description: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                image_url: string | null;
                calories: number | null;
                is_available: boolean;
            };
        } & {
            order_id: number;
            menu_id: number;
            created_at: Date;
            quantity: number;
            order_item_id: number;
            unit_price: number;
        })[];
    } & {
        order_id: number;
        total_price: import("@prisma/client/runtime/library").Decimal;
        status: string;
        promo_id: number | null;
        created_at: Date;
        table_id: number | null;
        user_id: number | null;
        order_type: string;
    }>;
    updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto): Promise<{
        order_id: number;
        total_price: import("@prisma/client/runtime/library").Decimal;
        status: string;
        promo_id: number | null;
        created_at: Date;
        table_id: number | null;
        user_id: number | null;
        order_type: string;
    }>;
}
