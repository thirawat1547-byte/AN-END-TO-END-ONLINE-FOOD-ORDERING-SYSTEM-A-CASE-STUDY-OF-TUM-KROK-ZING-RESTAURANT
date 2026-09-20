import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    create(createTransactionDto: CreateTransactionDto): Promise<{
        order_id: number;
        transaction_id: number;
        payment_method: string;
        payment_status: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        payment_slip_url: string | null;
    }>;
    findAll(): Promise<({
        order: {
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
        };
    } & {
        order_id: number;
        transaction_id: number;
        payment_method: string;
        payment_status: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        payment_slip_url: string | null;
    })[]>;
    createStripeIntent(orderId: number): Promise<{
        clientSecret: any;
        paymentIntentId: any;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
    }>;
    confirmStripeTest(orderId: number): Promise<{
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
