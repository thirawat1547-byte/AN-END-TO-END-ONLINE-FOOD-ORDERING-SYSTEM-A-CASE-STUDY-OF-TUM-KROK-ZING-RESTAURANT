import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(createOrderDto: CreateOrderDto, req: any): Promise<{
        order_items: ({
            menu: {
                menu_name: string;
                description: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                image_url: string | null;
                calories: number | null;
                is_available: boolean;
                menu_id: number;
                category_id: number;
            };
        } & {
            menu_id: number;
            quantity: number;
            notes: string | null;
            created_at: Date;
            order_id: number;
            unit_price: number;
            order_item_id: number;
        })[];
        promotion: {
            promo_id: number;
            created_at: Date;
            code: string;
            discount_type: string;
            discount_value: import("@prisma/client/runtime/library").Decimal;
            min_order_price: import("@prisma/client/runtime/library").Decimal;
            expiry_date: Date;
        };
        table: {
            table_id: number;
            table_number: string;
            capacity: number;
            status: string;
        };
    } & {
        user_id: number | null;
        table_id: number | null;
        status: string;
        order_type: string;
        promo_id: number | null;
        total_price: import("@prisma/client/runtime/library").Decimal;
        created_at: Date;
        order_id: number;
    }>;
    findAll(status?: string, tableId?: string, orderType?: string, date?: string): Promise<({
        order_items: ({
            menu: {
                menu_name: string;
                description: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                image_url: string | null;
                calories: number | null;
                is_available: boolean;
                menu_id: number;
                category_id: number;
            };
        } & {
            menu_id: number;
            quantity: number;
            notes: string | null;
            created_at: Date;
            order_id: number;
            unit_price: number;
            order_item_id: number;
        })[];
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
        promo_id: number | null;
        total_price: import("@prisma/client/runtime/library").Decimal;
        created_at: Date;
        order_id: number;
    })[]>;
    findMyActiveOrder(req: any, orderId?: string): Promise<{
        order_items: ({
            menu: {
                menu_name: string;
                description: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                image_url: string | null;
                calories: number | null;
                is_available: boolean;
                menu_id: number;
                category_id: number;
            };
        } & {
            menu_id: number;
            quantity: number;
            notes: string | null;
            created_at: Date;
            order_id: number;
            unit_price: number;
            order_item_id: number;
        })[];
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
        promo_id: number | null;
        total_price: import("@prisma/client/runtime/library").Decimal;
        created_at: Date;
        order_id: number;
    }>;
    findMyOrders(req: any): any[] | Promise<({
        order_items: ({
            menu: {
                menu_name: string;
                description: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                image_url: string | null;
                calories: number | null;
                is_available: boolean;
                menu_id: number;
                category_id: number;
            };
        } & {
            menu_id: number;
            quantity: number;
            notes: string | null;
            created_at: Date;
            order_id: number;
            unit_price: number;
            order_item_id: number;
        })[];
        table: {
            table_id: number;
            table_number: string;
            capacity: number;
            status: string;
        };
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
        promo_id: number | null;
        total_price: import("@prisma/client/runtime/library").Decimal;
        created_at: Date;
        order_id: number;
    })[]>;
    findOne(id: number): Promise<{
        order_items: ({
            menu: {
                menu_name: string;
                description: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                image_url: string | null;
                calories: number | null;
                is_available: boolean;
                menu_id: number;
                category_id: number;
            };
        } & {
            menu_id: number;
            quantity: number;
            notes: string | null;
            created_at: Date;
            order_id: number;
            unit_price: number;
            order_item_id: number;
        })[];
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
        promo_id: number | null;
        total_price: import("@prisma/client/runtime/library").Decimal;
        created_at: Date;
        order_id: number;
    }>;
    updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto): Promise<{
        user_id: number | null;
        table_id: number | null;
        status: string;
        order_type: string;
        promo_id: number | null;
        total_price: import("@prisma/client/runtime/library").Decimal;
        created_at: Date;
        order_id: number;
    }>;
}
