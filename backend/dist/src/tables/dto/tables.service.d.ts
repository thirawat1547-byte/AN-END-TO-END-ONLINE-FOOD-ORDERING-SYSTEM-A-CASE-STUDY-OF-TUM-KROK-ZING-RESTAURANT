import { PrismaService } from '../prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableStatusDto } from './dto/update-table-status.dto';
export declare class TablesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<any>;
    findOne(table_id: number): Promise<any>;
    create(createTableDto: CreateTableDto): Promise<any>;
    updateStatus(table_id: number, updateDto: UpdateTableStatusDto): Promise<any>;
}
