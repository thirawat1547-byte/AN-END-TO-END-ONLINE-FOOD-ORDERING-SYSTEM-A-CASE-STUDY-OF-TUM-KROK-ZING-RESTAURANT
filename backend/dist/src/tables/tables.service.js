"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TablesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let TablesService = class TablesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.table.findMany({
            orderBy: { table_id: 'asc' },
        });
    }
    async findOne(table_id) {
        const table = await this.prisma.table.findUnique({
            where: { table_id },
        });
        if (!table) {
            throw new common_1.NotFoundException(`ไม่พบโต๊ะรหัส ID #${table_id}`);
        }
        return table;
    }
    async create(createTableDto) {
        return this.prisma.table.create({
            data: {
                table_number: createTableDto.table_number,
                capacity: createTableDto.capacity,
                status: 'AVAILABLE',
            },
        });
    }
    async updateStatus(table_id, updateDto) {
        await this.findOne(table_id);
        return this.prisma.table.update({
            where: { table_id },
            data: { status: updateDto.status },
        });
    }
    async remove(table_id) {
        const table = await this.findOne(table_id);
        if (table.status === 'OCCUPIED' || table.status === 'BILLING') {
            throw new common_1.BadRequestException('ไม่สามารถลบโต๊ะที่กำลังมีลูกค้าใช้งานอยู่ได้ กรุณาปิดโต๊ะหรือเคลียร์บิลก่อนดำเนินการ');
        }
        await this.prisma.order.updateMany({
            where: { table_id },
            data: { table_id: null },
        });
        return this.prisma.table.delete({
            where: { table_id },
        });
    }
};
exports.TablesService = TablesService;
exports.TablesService = TablesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TablesService);
//# sourceMappingURL=tables.service.js.map