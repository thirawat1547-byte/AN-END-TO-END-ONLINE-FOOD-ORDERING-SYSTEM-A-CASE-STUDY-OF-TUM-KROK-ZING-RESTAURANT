import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(createOrderDto: CreateOrderDto, req: any): Promise<{
        promotion: {
            created_at: Date;
            promo_id: number;
            code: string;
            discount_type: string;
            discount_value: import("@prisma/client/runtime/library").Decimal;
            min_order_price: import("@prisma/client/runtime/library").Decimal;
            expiry_date: Date;
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
            created_at: Date;
            order_id: number;
            quantity: number;
            unit_price: number;
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
    findAll(status?: string, tableId?: string, orderType?: string): Promise<({
        user: {
            user_id: number;
            username: string;
            email: string;
            phone_number: string;
            address: string;
        };
        table: {
            status: string;
            table_id: number;
            table_number: string;
            capacity: number;
        };
        transaction: {
            order_id: number;
            transaction_id: number;
            amount: import("@prisma/client/runtime/library").Decimal;
            payment_method: string;
            payment_status: string;
            payment_slip_url: string | null;
        }[];
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
            order_id: number;
            quantity: number;
            unit_price: number;
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
    findMyActiveOrder(req: any, orderId?: string): Promise<{
        user: {
            user_id: number;
            username: string;
            phone_number: string;
            address: string;
        };
        table: {
            status: string;
            table_id: number;
            table_number: string;
            capacity: number;
        };
        transaction: {
            order_id: number;
            transaction_id: number;
            amount: import("@prisma/client/runtime/library").Decimal;
            payment_method: string;
            payment_status: string;
            payment_slip_url: string | null;
        }[];
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
            order_id: number;
            quantity: number;
            unit_price: number;
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
    findMyOrders(req: any): Promise<({
        table: {
            status: string;
            table_id: number;
            table_number: string;
            capacity: number;
        };
        transaction: {
            order_id: number;
            transaction_id: number;
            amount: import("@prisma/client/runtime/library").Decimal;
            payment_method: string;
            payment_status: string;
            payment_slip_url: string | null;
        }[];
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
            order_id: number;
            quantity: number;
            unit_price: number;
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
            address: string;
        };
        table: {
            status: string;
            table_id: number;
            table_number: string;
            capacity: number;
        };
        transaction: {
            order_id: number;
            transaction_id: number;
            amount: import("@prisma/client/runtime/library").Decimal;
            payment_method: string;
            payment_status: string;
            payment_slip_url: string | null;
        }[];
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
            order_id: number;
            quantity: number;
            unit_price: number;
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
