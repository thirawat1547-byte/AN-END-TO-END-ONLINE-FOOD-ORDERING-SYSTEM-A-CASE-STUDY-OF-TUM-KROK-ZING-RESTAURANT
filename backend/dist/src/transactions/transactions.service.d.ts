import { PrismaService } from '../prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
export declare class TransactionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createTransactionDto: CreateTransactionDto): Promise<{
        order_id: number;
        amount: import("@prisma/client/runtime/library").Decimal;
        payment_method: string;
        payment_slip_url: string | null;
        payment_status: string;
        transaction_id: number;
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
                    description: string | null;
                    menu_name: string;
                    price: import("@prisma/client/runtime/library").Decimal;
                    image_url: string | null;
                    calories: number | null;
                    is_available: boolean;
                    menu_id: number;
                    category_id: number;
                };
            } & {
                menu_id: number;
                created_at: Date;
                order_id: number;
                quantity: number;
                unit_price: number;
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
        };
    } & {
        order_id: number;
        amount: import("@prisma/client/runtime/library").Decimal;
        payment_method: string;
        payment_slip_url: string | null;
        payment_status: string;
        transaction_id: number;
    })[]>;
}
