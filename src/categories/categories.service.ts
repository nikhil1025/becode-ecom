import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { S3Service } from '../storage/s3.service';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private s3: S3Service,
  ) {}

  async findAll(): Promise<any[]> {
    try {
      return await this.prisma.category.findMany({
        include: {
          parent: true,
          children: true,
          _count: {
            select: { products: true },
          },
        },
        orderBy: { position: 'asc' },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve categories: ' + error.message,
      );
    }
  }

  async findOne(id: string): Promise<any> {
    try {
      if (!id) {
        throw new BadRequestException('Category ID is required');
      }

      const category = await this.prisma.category.findUnique({
        where: { id },
        include: {
          parent: true,
          children: true,
          products: {
            take: 10,
            include: {
              images: {
                where: { isFeatured: true },
                take: 1,
              },
            },
          },
          _count: {
            select: { products: true },
          },
        },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      return category;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve category: ' + error.message,
      );
    }
  }

  async getSubcategories(parentId: string): Promise<any[]> {
    try {
      if (!parentId) {
        throw new BadRequestException('Parent category ID is required');
      }

      return await this.prisma.category.findMany({
        where: { parentId },
        include: {
          _count: {
            select: { products: true },
          },
        },
        orderBy: { position: 'asc' },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve subcategories: ' + error.message,
      );
    }
  }

  async create(data: {
    name: string;
    slug: string;
    description?: string;
    image?: string;
    parentId?: string;
    position?: number;
  }): Promise<any> {
    try {
      if (!data.name || data.name.trim().length === 0) {
        throw new BadRequestException('Category name is required');
      }
      if (!data.slug || data.slug.trim().length === 0) {
        throw new BadRequestException('Category slug is required');
      }

      // Check if slug already exists
      const existing = await this.prisma.category.findUnique({
        where: { slug: data.slug },
      });

      if (existing) {
        throw new ConflictException('Category with this slug already exists');
      }

      return this.prisma.category.create({
        data,
        include: {
          parent: true,
          children: true,
        },
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create category: ' + error.message,
      );
    }
  }

  async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      image?: string;
      parentId?: string;
      position?: number;
    },
  ): Promise<any> {
    try {
      if (!id) {
        throw new BadRequestException('Category ID is required');
      }
      if (!data || Object.keys(data).length === 0) {
        throw new BadRequestException('Update data is required');
      }

      const category = await this.prisma.category.findUnique({
        where: { id },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      // Prevent circular references
      if (data.parentId === id) {
        throw new ConflictException('Category cannot be its own parent');
      }

      return this.prisma.category.update({
        where: { id },
        data,
        include: {
          parent: true,
          children: true,
        },
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update category: ' + error.message,
      );
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      if (!id) {
        throw new BadRequestException('Category ID is required');
      }

      const category = await this.prisma.category.findUnique({
        where: { id },
        include: {
          products: true,
          children: true,
        },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      if (category.products.length > 0) {
        throw new ConflictException(
          'Cannot delete category with associated products',
        );
      }

      if (category.children.length > 0) {
        throw new ConflictException(
          'Cannot delete category with subcategories',
        );
      }

      await this.prisma.category.delete({
        where: { id },
      });

      return { message: 'Category deleted successfully' };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to delete category: ' + error.message,
      );
    }
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    try {
      const { url } = await this.s3.uploadProductImage('categories', file);
      return url;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to upload category image: ' + error.message,
      );
    }
  }
}
