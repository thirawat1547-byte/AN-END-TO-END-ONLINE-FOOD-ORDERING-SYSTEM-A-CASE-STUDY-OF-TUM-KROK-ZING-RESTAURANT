import { PrismaService } from '../prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersGateway } from './orders.gateway';
export declare class OrdersService {
    private readonly prisma;
    private readonly ordersGateway;
    constructor(prisma: PrismaService, ordersGateway: OrdersGateway);
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
                category_id: number;
                menu_id: number;
                menu_name: string;
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
            order_item_id: number;
        })[];
    } & {
        user_id: number | null;
        table_id: number | null;
        status: string;
        created_at: Date;
        order_type: string;
        total_price: import("@prisma/client/runtime/library").Decimal;
        order_id: number;
        promo_id: number | null;
    }>;
    findAll(status?: string, tableId?: number, orderType?: string): Promise<({
        user: {
            username: string;
            email: string;
            phone_number: string;
            address: string;
            user_id: number;
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
        order_items: ({
            menu: {
                description: string | null;
                category_id: number;
                menu_id: number;
                menu_name: string;
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
            order_item_id: number;
        })[];
    } & {
        user_id: number | null;
        table_id: number | null;
        status: string;
        created_at: Date;
        order_type: string;
        total_price: import("@prisma/client/runtime/library").Decimal;
        order_id: number;
        promo_id: number | null;
    })[]>;
    findByUser(userId: number): Promise<({
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
        order_items: ({
            menu: {
                description: string | null;
                category_id: number;
                menu_id: number;
                menu_name: string;
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
            order_item_id: number;
        })[];
    } & {
        user_id: number | null;
        table_id: number | null;
        status: string;
        created_at: Date;
        order_type: string;
        total_price: import("@prisma/client/runtime/library").Decimal;
        order_id: number;
        promo_id: number | null;
    })[]>;
    findOne(id: number): Promise<{
        user: {
            username: string;
            phone_number: string;
            address: string;
            user_id: number;
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
        order_items: ({
            menu: {
                description: string | null;
                category_id: number;
                menu_id: number;
                menu_name: string;
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
            order_item_id: number;
        })[];
    } & {
        user_id: number | null;
        table_id: number | null;
        status: string;
        created_at: Date;
        order_type: string;
        total_price: import("@prisma/client/runtime/library").Decimal;
        order_id: number;
        promo_id: number | null;
    }>;
    updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto): Promise<{
        user_id: number | null;
        table_id: number | null;
        status: string;
        created_at: Date;
        order_type: string;
        total_price: import("@prisma/client/runtime/library").Decimal;
        order_id: number;
        promo_id: number | null;
    }>;
}
