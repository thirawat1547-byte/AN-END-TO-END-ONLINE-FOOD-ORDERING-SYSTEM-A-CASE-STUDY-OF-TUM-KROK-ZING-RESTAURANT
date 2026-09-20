import { PrismaService } from '../prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableStatusDto } from './dto/update-table-status.dto';
export declare class TablesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        table_number: string;
        status: string;
        table_id: number;
        capacity: number;
    }[]>;
    findOne(table_id: number): Promise<{
        table_number: string;
        status: string;
        table_id: number;
        capacity: number;
    }>;
    create(createTableDto: CreateTableDto): Promise<{
        table_number: string;
        status: string;
        table_id: number;
        capacity: number;
    }>;
    updateStatus(table_id: number, updateDto: UpdateTableStatusDto): Promise<{
        table_number: string;
        status: string;
        table_id: number;
        capacity: number;
    }>;
}
