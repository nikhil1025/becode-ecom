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

  async getHeaderNavigation() {
    const tabs = await this.prisma.navigationTab.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    const result = await Promise.all(
      tabs.map(async (tab) => {
        const baseItem = {
          id: tab.id,
          type: tab.type,
          label: tab.label,
          url: tab.url,
          order: tab.order,
        };

        if (tab.type === 'CATEGORY' && tab.refId) {
          const category = await this.prisma.category.findUnique({
            where: { id: tab.refId },
            select: { id: true, name: true, slug: true },
          });
          if (category) {
            return {
              ...baseItem,
              url: `/shop/products?category=${category.slug}`,
              category,
            };
          }
        } else if (tab.type === 'COLLECTION' && tab.refId) {
          const collection = await this.prisma.collection.findUnique({
            where: { id: tab.refId },
            select: { id: true, name: true, slug: true },
          });
          if (collection) {
            return {
              ...baseItem,
              url: `/collections/${collection.slug}`,
              collection,
            };
          }
        }

        return baseItem;
      }),
    );

    return result;
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
