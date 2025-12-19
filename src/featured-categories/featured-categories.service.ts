import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateFeaturedCategoryDto } from './dto/create-featured-category.dto';
import { UpdateFeaturedCategoryDto } from './dto/update-featured-category.dto';

@Injectable()
export class FeaturedCategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFeaturedCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) throw new NotFoundException('Category not found');

    const existing = await this.prisma.featuredCategory.findUnique({
      where: { categoryId: dto.categoryId },
    });
    if (existing) throw new ConflictException('Category is already featured');

    return this.prisma.featuredCategory.create({
      data: {
        categoryId: dto.categoryId,
        priority: dto.priority ?? 0,
        isActive: dto.isActive ?? true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            image: true,
            _count: { select: { products: true } },
          },
        },
      },
    });
  }

  async findAll(isActive?: boolean) {
    return this.prisma.featuredCategory.findMany({
      where: isActive !== undefined ? { isActive } : undefined,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            image: true,
            _count: { select: { products: true } },
          },
        },
      },
      orderBy: { priority: 'asc' },
    });
  }

  async findOne(id: string) {
    const featured = await this.prisma.featuredCategory.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            image: true,
            _count: { select: { products: true } },
          },
        },
      },
    });
    if (!featured) throw new NotFoundException('Featured category not found');
    return featured;
  }

  async update(id: string, dto: UpdateFeaturedCategoryDto) {
    await this.findOne(id);
    return this.prisma.featuredCategory.update({
      where: { id },
      data: dto,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            image: true,
            _count: { select: { products: true } },
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.featuredCategory.delete({ where: { id } });
  }

  async reorder(items: { id: string; priority: number }[]) {
    const updates = items.map((item) =>
      this.prisma.featuredCategory.update({
        where: { id: item.id },
        data: { priority: item.priority },
      }),
    );
    await this.prisma.$transaction(updates);
    return { message: 'Reordered successfully' };
  }
}
