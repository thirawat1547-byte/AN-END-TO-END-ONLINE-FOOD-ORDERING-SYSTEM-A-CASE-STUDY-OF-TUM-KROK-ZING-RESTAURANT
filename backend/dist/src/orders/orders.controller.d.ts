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
                category_id: number;
                menu_id: number;
                menu_name: string;
                description: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                image_url: string | null;
                calories: number | null;
                is_available: boolean;
            };
        } & {
            menu_id: number;
            quantity: number;
            created_at: Date;
            order_id: number;
            unit_price: number;
            notes: string | null;
            order_item_id: number;
        })[];
        promotion: {
            created_at: Date;
            promo_id: number;
            code: string;
            discount_type: string;
            discount_value: import("@prisma/client/runtime/library").Decimal;
            min_order_price: import("@prisma/client/runtime/library").Decimal;
            expiry_date: Date;
        };
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
    findAll(status?: string, tableId?: string, orderType?: string, date?: string): Promise<({
        user: {
            user_id: number;
            username: string;
            email: string;
            phone_number: string;
            address: string;
        };
        table: {
            table_id: number;
            table_number: string;
            capacity: number;
            status: string;
        };
        order_items: ({
            menu: {
                category_id: number;
                menu_id: number;
                menu_name: string;
                description: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                image_url: string | null;
                calories: number | null;
                is_available: boolean;
            };
        } & {
            menu_id: number;
            quantity: number;
            created_at: Date;
            order_id: number;
            unit_price: number;
            notes: string | null;
            order_item_id: number;
        })[];
        transaction: {
            order_id: number;
            transaction_id: number;
            amount: import("@prisma/client/runtime/library").Decimal;
            payment_method: string;
            payment_status: string;
            payment_slip_url: string | null;
        }[];
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
    findMyActiveOrder(req: any, orderId?: string): Promise<{
        user: {
            user_id: number;
            username: string;
            phone_number: string;
            address: string;
        };
        table: {
            table_id: number;
            table_number: string;
            capacity: number;
            status: string;
        };
        order_items: ({
            menu: {
                category_id: number;
                menu_id: number;
                menu_name: string;
                description: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                image_url: string | null;
                calories: number | null;
                is_available: boolean;
            };
        } & {
            menu_id: number;
            quantity: number;
            created_at: Date;
            order_id: number;
            unit_price: number;
            notes: string | null;
            order_item_id: number;
        })[];
        transaction: {
            order_id: number;
            transaction_id: number;
            amount: import("@prisma/client/runtime/library").Decimal;
            payment_method: string;
            payment_status: string;
            payment_slip_url: string | null;
        }[];
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
    findMyOrders(req: any): any[] | Promise<({
        table: {
            table_id: number;
            table_number: string;
            capacity: number;
            status: string;
        };
        order_items: ({
            menu: {
                category_id: number;
                menu_id: number;
                menu_name: string;
                description: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                image_url: string | null;
                calories: number | null;
                is_available: boolean;
            };
        } & {
            menu_id: number;
            quantity: number;
            created_at: Date;
            order_id: number;
            unit_price: number;
            notes: string | null;
            order_item_id: number;
        })[];
        transaction: {
            order_id: number;
            transaction_id: number;
            amount: import("@prisma/client/runtime/library").Decimal;
            payment_method: string;
            payment_status: string;
            payment_slip_url: string | null;
        }[];
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
            address: string;
        };
        table: {
            table_id: number;
            table_number: string;
            capacity: number;
            status: string;
        };
        order_items: ({
            menu: {
                category_id: number;
                menu_id: number;
                menu_name: string;
                description: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                image_url: string | null;
                calories: number | null;
                is_available: boolean;
            };
        } & {
            menu_id: number;
            quantity: number;
            created_at: Date;
            order_id: number;
            unit_price: number;
            notes: string | null;
            order_item_id: number;
        })[];
        transaction: {
            order_id: number;
            transaction_id: number;
            amount: import("@prisma/client/runtime/library").Decimal;
            payment_method: string;
            payment_status: string;
            payment_slip_url: string | null;
        }[];
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
