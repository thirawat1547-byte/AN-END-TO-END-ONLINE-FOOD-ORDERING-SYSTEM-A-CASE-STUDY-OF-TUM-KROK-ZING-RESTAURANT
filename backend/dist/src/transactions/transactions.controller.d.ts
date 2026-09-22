import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    create(createTransactionDto: CreateTransactionDto): Promise<{
        order_id: number;
        transaction_id: number;
        amount: import("@prisma/client/runtime/library").Decimal;
        payment_method: string;
        payment_status: string;
        payment_slip_url: string | null;
    }>;
    findAll(): Promise<({
        order: {
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
        } & {
            user_id: number | null;
            table_id: number | null;
            status: string;
            order_type: string;
            promo_id: number | null;
            total_price: import("@prisma/client/runtime/library").Decimal;
            created_at: Date;
            order_id: number;
        };
    } & {
        order_id: number;
        transaction_id: number;
        amount: import("@prisma/client/runtime/library").Decimal;
        payment_method: string;
        payment_status: string;
        payment_slip_url: string | null;
    })[]>;
    createStripeIntent(orderId: number): Promise<{
        clientSecret: any;
        paymentIntentId: any;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
    }>;
    confirmStripeTest(orderId: number): Promise<{
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
