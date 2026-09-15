import { PrismaService } from '../prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
export declare class TransactionsService {
    private readonly prisma;
    private stripe;
    constructor(prisma: PrismaService);
    create(createTransactionDto: CreateTransactionDto): Promise<{
        amount: import("@prisma/client/runtime/library").Decimal;
        payment_method: string;
        payment_status: string;
        payment_slip_url: string | null;
        transaction_id: number;
        order_id: number;
    }>;
    findAll(): Promise<({
        order: {
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
        };
    } & {
        amount: import("@prisma/client/runtime/library").Decimal;
        payment_method: string;
        payment_status: string;
        payment_slip_url: string | null;
        transaction_id: number;
        order_id: number;
    })[]>;
    createStripeIntent(orderId: number): Promise<{
        clientSecret: any;
        paymentIntentId: any;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
    }>;
    confirmStripePaymentTest(orderId: number): Promise<{
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
