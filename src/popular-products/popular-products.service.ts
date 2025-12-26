import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePopularProductDto } from './dto/create-popular-product.dto';
import { UpdatePopularProductDto } from './dto/update-popular-product.dto';

@Injectable()
export class PopularProductsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePopularProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    const existing = await this.prisma.popularProduct.findUnique({
      where: { productId: dto.productId },
    });
    if (existing)
      throw new ConflictException('Product is already marked as popular');

    return this.prisma.popularProduct.create({
      data: {
        productId: dto.productId,
        priority: dto.priority ?? 0,
        score: dto.score ?? 0,
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
    return this.prisma.popularProduct.findMany({
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
              where: { isActive: true },
              take: 1,
              select: {
                price: true,
                salePrice: true,
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
    const popular = await this.prisma.popularProduct.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            variants: {
              where: { isActive: true },
              take: 1,
              select: {
                price: true,
                salePrice: true,
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
      },
    });
    if (!popular) throw new NotFoundException('Popular product not found');
    return popular;
  }

  async update(id: string, dto: UpdatePopularProductDto) {
    await this.findOne(id);
    return this.prisma.popularProduct.update({
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
    return this.prisma.popularProduct.delete({ where: { id } });
  }

  async reorder(items: { id: string; priority: number }[]) {
    const updates = items.map((item) =>
      this.prisma.popularProduct.update({
        where: { id: item.id },
        data: { priority: item.priority },
      }),
    );
    await this.prisma.$transaction(updates);
    return { message: 'Reordered successfully' };
  }
}
