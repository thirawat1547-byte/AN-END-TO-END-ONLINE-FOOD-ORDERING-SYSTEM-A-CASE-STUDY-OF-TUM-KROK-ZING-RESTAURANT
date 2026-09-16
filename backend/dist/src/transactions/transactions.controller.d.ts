import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    create(createTransactionDto: CreateTransactionDto): Promise<{
        order_id: number;
        amount: import("@prisma/client/runtime/library").Decimal;
        payment_method: string;
        payment_status: string;
        payment_slip_url: string | null;
        transaction_id: number;
    }>;
    findAll(): Promise<({
        order: {
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
        };
    } & {
        order_id: number;
        amount: import("@prisma/client/runtime/library").Decimal;
        payment_method: string;
        payment_status: string;
        payment_slip_url: string | null;
        transaction_id: number;
    })[]>;
    createStripeIntent(orderId: number): Promise<{
        clientSecret: any;
        paymentIntentId: any;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
    }>;
    confirmStripeTest(orderId: number): Promise<{
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
