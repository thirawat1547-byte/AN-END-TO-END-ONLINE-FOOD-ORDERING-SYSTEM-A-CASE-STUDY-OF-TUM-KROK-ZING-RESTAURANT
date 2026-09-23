import { PrismaService } from '../prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableStatusDto } from './dto/update-table-status.dto';
export declare class TablesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        table_id: number;
        table_number: string;
        capacity: number;
        status: string;
    }[]>;
    findOne(table_id: number): Promise<{
        table_id: number;
        table_number: string;
        capacity: number;
        status: string;
    }>;
    create(createTableDto: CreateTableDto): Promise<{
        table_id: number;
        table_number: string;
        capacity: number;
        status: string;
    }>;
    updateStatus(table_id: number, updateDto: UpdateTableStatusDto): Promise<{
        table_id: number;
        table_number: string;
        capacity: number;
        status: string;
    }>;
    remove(table_id: number): Promise<{
        table_id: number;
        table_number: string;
        capacity: number;
        status: string;
    }>;
}
