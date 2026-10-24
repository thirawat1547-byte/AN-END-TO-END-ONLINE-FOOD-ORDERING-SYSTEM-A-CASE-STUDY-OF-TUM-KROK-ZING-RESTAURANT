import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableStatusDto } from './dto/update-table-status.dto';

@Injectable()
export class TablesService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. ดูรายการโต๊ะอาหารทั้งหมด
  async findAll() {
    return this.prisma.table.findMany({
      orderBy: { table_id: 'asc' },
    });
  }

  // 2. ดูรายละเอียดโต๊ะรายตัวตาม ID
  async findOne(table_id: number) {
    const table = await this.prisma.table.findUnique({
      where: { table_id },
    });
    if (!table) {
      throw new NotFoundException(`ไม่พบโต๊ะรหัส ID #${table_id}`);
    }
    return table;
  }

  // 3. เพิ่มโต๊ะอาหารใหม่
  async create(createTableDto: CreateTableDto) {
    return this.prisma.table.create({
      data: {
        table_number: createTableDto.table_number,
        capacity: createTableDto.capacity,
        status: 'AVAILABLE',
      },
    });
  }

  // 4. อัปเดตสถานะโต๊ะ
  async updateStatus(table_id: number, updateDto: UpdateTableStatusDto) {
    await this.findOne(table_id);

    return this.prisma.table.update({
      where: { table_id },
      data: { status: updateDto.status },
    });
  }
}