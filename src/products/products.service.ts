import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { S3Service } from '../storage/s3.service';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private s3: S3Service,
  ) {}

  async findAll(filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    featured?: boolean;
  }): Promise<any[]> {
    try {
      // Validate price filters
      if (filters?.minPrice && filters.minPrice < 0) {
        throw new BadRequestException('Minimum price cannot be negative');
      }
      if (filters?.maxPrice && filters.maxPrice < 0) {
        throw new BadRequestException('Maximum price cannot be negative');
      }
      if (
        filters?.minPrice &&
        filters?.maxPrice &&
        filters.minPrice > filters.maxPrice
      ) {
        throw new BadRequestException(
          'Minimum price cannot exceed maximum price',
        );
      }

      const where: any = { status: 'PUBLISHED' };

      if (filters?.category) {
        where.category = { slug: filters.category };
      }

      if (filters?.minPrice || filters?.maxPrice) {
        where.regularPrice = {};
        if (filters.minPrice) where.regularPrice.gte = filters.minPrice;
        if (filters.maxPrice) where.regularPrice.lte = filters.maxPrice;
      }

      if (filters?.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          {
            shortDescription: { contains: filters.search, mode: 'insensitive' },
          },
        ];
      }

      if (filters?.featured) {
        where.isFeatured = true;
      }

      return this.prisma.product.findMany({
        where,
        include: {
          images: true,
          category: true,
          brand: true,
          reviews: true
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve products: ' + error.message,
      );
    }
  }

  async findOne(id: string): Promise<any> {
    try {
      if (!id) {
        throw new BadRequestException('Product ID is required');
      }

      const product = await this.prisma.product.findUnique({
        where: { id },
        include: {
          images: true,
          category: true,
          brand: true,
          variants: true,
          reviews: {
            where: { status: 'APPROVED' },
            include: { user: { select: { firstName: true, lastName: true } } },
          },
        },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      return product;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve product: ' + error.message,
      );
    }
  }

  async create(data: any): Promise<any> {
    try {
      if (!data) {
        throw new BadRequestException('Product data is required');
      }
      if (!data.name) {
        throw new BadRequestException('Product name is required');
      }
      if (!data.regularPrice || data.regularPrice < 0) {
        throw new BadRequestException('Valid regular price is required');
      }

      // Map DTO fields to Prisma schema fields
      const {
        description,
        stock,
        isNewArrival,
        images,
        variants,
        specifications,
        tags,
        ...rest
      } = data;
      const prismaData: any = {
        ...rest,
        longDescription: description,
        stockQuantity: stock || 0,
      };

      // Remove undefined fields
      Object.keys(prismaData).forEach((key) => {
        if (prismaData[key] === undefined) {
          delete prismaData[key];
        }
      });

      return this.prisma.product.create({
        data: prismaData,
        include: {
          images: true,
          category: true,
          brand: true,
        },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create product: ' + error.message,
      );
    }
  }

  async update(id: string, data: any): Promise<any> {
    try {
      if (!id) {
        throw new BadRequestException('Product ID is required');
      }
      if (!data || Object.keys(data).length === 0) {
        throw new BadRequestException('Update data is required');
      }
      if (data.regularPrice && data.regularPrice < 0) {
        throw new BadRequestException('Regular price cannot be negative');
      }

      const existingProduct = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      // Map DTO fields to Prisma schema fields
      const {
        description,
        stock,
        isNewArrival,
        images,
        variants,
        specifications,
        tags,
        ...rest
      } = data;
      const prismaData: any = { ...rest };

      if (description !== undefined) prismaData.longDescription = description;
      if (stock !== undefined) prismaData.stockQuantity = stock;

      // Remove undefined fields
      Object.keys(prismaData).forEach((key) => {
        if (prismaData[key] === undefined) {
          delete prismaData[key];
        }
      });

      return this.prisma.product.update({
        where: { id },
        data: prismaData,
        include: {
          images: true,
          category: true,
          brand: true,
        },
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update product: ' + error.message,
      );
    }
  }

  async delete(id: string): Promise<any> {
    try {
      if (!id) {
        throw new BadRequestException('Product ID is required');
      }

      const existingProduct = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      return this.prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to delete product: ' + error.message,
      );
    }
  }

  async uploadImages(
    productId: string,
    files: Express.Multer.File[],
  ): Promise<any> {
    try {
      if (!productId) {
        throw new BadRequestException('Product ID is required');
      }
      if (!files || files.length === 0) {
        throw new BadRequestException('No files uploaded');
      }

      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      const uploadedImages: any[] = [];
      for (const file of files) {
        const { url } = await this.s3.uploadProductImage(productId, file);
        const image = await this.prisma.productImage.create({
          data: {
            productId,
            url,
            altText: product.name,
          },
        });
        uploadedImages.push(image);
      }

      return uploadedImages;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to upload images: ' + error.message,
      );
    }
  }

  async uploadProductImages(files: Express.Multer.File[]): Promise<string[]> {
    try {
      if (!files || files.length === 0) {
        return [];
      }

      const uploadPromises = files.map((file) =>
        this.s3.uploadProductImage('temp', file),
      );
      const uploadResults = await Promise.all(uploadPromises);

      return uploadResults.map((result) => result.url);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to upload product images: ' + error.message,
      );
    }
  }
}
