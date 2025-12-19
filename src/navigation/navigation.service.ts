import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateNavigationDto } from './dto/create-navigation.dto';
import { UpdateNavigationDto } from './dto/update-navigation.dto';

@Injectable()
export class NavigationService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateNavigationDto) {
    return this.prisma.navigationTab.create({
      data: { ...dto, order: dto.order ?? 0, isActive: dto.isActive ?? true },
    });
  }

  async findAll(isActive?: boolean) {
    return this.prisma.navigationTab.findMany({
      where: isActive !== undefined ? { isActive } : undefined,
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const nav = await this.prisma.navigationTab.findUnique({ where: { id } });
    if (!nav) throw new NotFoundException('Navigation tab not found');
    return nav;
  }

  async update(id: string, dto: UpdateNavigationDto) {
    await this.findOne(id);
    return this.prisma.navigationTab.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.navigationTab.delete({ where: { id } });
  }

  async reorder(items: { id: string; order: number }[]) {
    const updates = items.map((item) =>
      this.prisma.navigationTab.update({
        where: { id: item.id },
        data: { order: item.order },
      }),
    );
    await this.prisma.$transaction(updates);
    return { message: 'Reordered successfully' };
  }
}
