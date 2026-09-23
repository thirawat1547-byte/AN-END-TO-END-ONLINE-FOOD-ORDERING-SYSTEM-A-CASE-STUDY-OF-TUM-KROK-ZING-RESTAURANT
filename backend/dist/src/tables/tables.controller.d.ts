import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableStatusDto } from './dto/update-table-status.dto';
export declare class TablesController {
    private readonly tablesService;
    constructor(tablesService: TablesService);
    findAll(): Promise<{
        table_id: number;
        table_number: string;
        capacity: number;
        status: string;
    }[]>;
    findOne(id: number): Promise<{
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
    updateStatus(id: number, updateDto: UpdateTableStatusDto): Promise<{
        table_id: number;
        table_number: string;
        capacity: number;
        status: string;
    }>;
    remove(id: number): Promise<{
        table_id: number;
        table_number: string;
        capacity: number;
        status: string;
    }>;
}
