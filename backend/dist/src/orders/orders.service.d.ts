import { PrismaService } from '../prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
export declare class OrdersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createOrderDto: CreateOrderDto): Promise<{
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
            created_at: Date;
            order_id: number;
            quantity: number;
            unit_price: number;
            notes: string | null;
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
    findAll(status?: string, tableId?: number): Promise<({
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
            created_at: Date;
            order_id: number;
            quantity: number;
            unit_price: number;
            notes: string | null;
            order_item_id: number;
        })[];
        transaction: {
            order_id: number;
            amount: import("@prisma/client/runtime/library").Decimal;
            payment_method: string;
            payment_slip_url: string | null;
            payment_status: string;
            transaction_id: number;
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
    findByUser(userId: number): Promise<({
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
            created_at: Date;
            order_id: number;
            quantity: number;
            unit_price: number;
            notes: string | null;
            order_item_id: number;
        })[];
        transaction: {
            order_id: number;
            amount: import("@prisma/client/runtime/library").Decimal;
            payment_method: string;
            payment_slip_url: string | null;
            payment_status: string;
            transaction_id: number;
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
            created_at: Date;
            order_id: number;
            quantity: number;
            unit_price: number;
            notes: string | null;
            order_item_id: number;
        })[];
        transaction: {
            order_id: number;
            amount: import("@prisma/client/runtime/library").Decimal;
            payment_method: string;
            payment_slip_url: string | null;
            payment_status: string;
            transaction_id: number;
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
