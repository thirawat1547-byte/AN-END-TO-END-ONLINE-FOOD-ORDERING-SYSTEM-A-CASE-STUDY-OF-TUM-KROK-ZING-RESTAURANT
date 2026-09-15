import { PrismaService } from '../prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
export declare class OrdersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createOrderDto: CreateOrderDto): Promise<any>;
    findAll(status?: string, tableId?: number): Promise<any>;
    findOne(id: number): Promise<any>;
    updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto): Promise<any>;
}
