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
var _a;
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
            include: {
                orders: {
                    where: {
                        status: { in: ['PENDING', 'COOKING', 'READY'] },
                    },
                    select: {
                        order_id: true,
                        status: true,
                        total_price: true,
                    },
                },
            },
        });
    }
    async findOne(table_id) {
        const table = await this.prisma.table.findUnique({
            where: { table_id },
        });
        if (!table) {
            throw new common_1.NotFoundException(`ไม่พบโต๊ะหมายเลข ID #${table_id}`);
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
};
exports.TablesService = TablesService;
exports.TablesService = TablesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], TablesService);
//# sourceMappingURL=tables.service.js.map