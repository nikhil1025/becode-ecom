import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateFeaturedProductDto } from './dto/create-featured-product.dto';
import { UpdateFeaturedProductDto } from './dto/update-featured-product.dto';

@Injectable()
export class FeaturedProductsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFeaturedProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    const existing = await this.prisma.featuredProduct.findUnique({
      where: { productId: dto.productId },
    });
    if (existing) throw new ConflictException('Product is already featured');

    return this.prisma.featuredProduct.create({
      data: {
        productId: dto.productId,
        priority: dto.priority ?? 0,
        isActive: dto.isActive ?? true,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            variants: {
              take: 1,
              include: {
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
      },
    });
  }

  async findAll(isActive?: boolean) {
    return this.prisma.featuredProduct.findMany({
      where: isActive !== undefined ? { isActive } : undefined,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            category: { select: { name: true } },
            brand: { select: { name: true } },
            variants: {
              take: 1,
              include: {
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
      },
      orderBy: { priority: 'asc' },
    });
  }

  async findOne(id: string) {
    const featured = await this.prisma.featuredProduct.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            variants: {
              take: 1,
              include: {
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
      },
    });
    if (!featured) throw new NotFoundException('Featured product not found');
    return featured;
  }

  async update(id: string, dto: UpdateFeaturedProductDto) {
    await this.findOne(id);
    return this.prisma.featuredProduct.update({
      where: { id },
      data: dto,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            variants: {
              take: 1,
              include: {
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.featuredProduct.delete({ where: { id } });
  }

  async reorder(items: { id: string; priority: number }[]) {
    const updates = items.map((item) =>
      this.prisma.featuredProduct.update({
        where: { id: item.id },
        data: { priority: item.priority },
      }),
    );
    await this.prisma.$transaction(updates);
    return { message: 'Reordered successfully' };
  }
}
