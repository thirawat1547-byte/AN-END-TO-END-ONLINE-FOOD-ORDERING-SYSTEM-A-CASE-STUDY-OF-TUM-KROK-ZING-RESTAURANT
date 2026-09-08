import { PrismaService } from '../prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
export declare class TransactionsService {
    private readonly prisma;
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
                status: string;
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
                order_id: number;
                order_item_id: number;
                menu_id: number;
                quantity: number;
                customization: import("@prisma/client/runtime/library").JsonValue | null;
                subtotal: import("@prisma/client/runtime/library").Decimal;
            })[];
        } & {
            order_id: number;
            user_id: number | null;
            table_id: number | null;
            promo_id: number | null;
            order_type: string;
            status: string;
            total_price: import("@prisma/client/runtime/library").Decimal;
            created_at: Date;
        };
    } & {
        amount: import("@prisma/client/runtime/library").Decimal;
        payment_method: string;
        payment_status: string;
        payment_slip_url: string | null;
        transaction_id: number;
        order_id: number;
    })[]>;
}
