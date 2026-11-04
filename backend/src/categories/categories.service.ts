import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { category_id: 'asc' },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { category_id: id },
    });

    if (!category) {
      throw new NotFoundException(`ไม่พบหมวดหมู่อาหารรหัส #${id}`);
    }

    return category;
  }
}

