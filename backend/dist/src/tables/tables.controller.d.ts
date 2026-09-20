import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableStatusDto } from './dto/update-table-status.dto';
export declare class TablesController {
    private readonly tablesService;
    constructor(tablesService: TablesService);
    findAll(): Promise<{
        table_number: string;
        status: string;
        table_id: number;
        capacity: number;
    }[]>;
    findOne(id: number): Promise<{
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
    updateStatus(id: number, updateDto: UpdateTableStatusDto): Promise<{
        table_number: string;
        status: string;
        table_id: number;
        capacity: number;
    }>;
}
