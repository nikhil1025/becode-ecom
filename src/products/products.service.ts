import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { FileUploadService } from '../common/services/file-upload.service';
import { stat } from 'fs';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private fileUploadService: FileUploadService,
  ) {}

  async findAll(filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
  }): Promise<any> {
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

      const where: any = {
        status: 'PUBLISHED',
        isDeleted: false, // Exclude deleted products from user view
      };

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

      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const skip = (page - 1) * limit;

      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          select: {
            id: true,
            name: true,
            slug: true,
            regularPrice: true,
            salePrice: true,
            stockQuantity: true,
            averageRating: true,
            reviewCount: true,
            isFeatured: true,
            longDescription: true,
            shortDescription: true,
            sku: true,
            status: true,
            images: {
              select: {
                id: true,
                url: true,
                altText: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            brand: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.product.count({ where }),
      ]);

      // Transform to match expected structure with thumbnail
      const transformedProducts = products.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.regularPrice,
        salePrice: product.salePrice,
        discount: product.salePrice
          ? Math.round(
              ((product.regularPrice - product.salePrice) /
                product.regularPrice) *
                100,
            )
          : 0,
        thumbnail: product.images[0]?.url || null,
        thumbnailAlt: product.images[0]?.altText || product.name,
        stock: product.stockQuantity,
        averageRating: product.averageRating,
        reviewCount: product.reviewCount,
        isFeatured: product.isFeatured,
        category: product.category,
        brand: product.brand,
        images: product.images,
        shortDescription: product.shortDescription,
        longDescription: product.longDescription,
        sku: product.sku,
        status: product.status,
      }));

      return {
        products: transformedProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
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
        where: {
          id,
          isDeleted: false, // Exclude deleted products from user view
        },
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
        include: {
          orderItems: true,
        },
      });

      if (!existingProduct) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      // Prevent deletion if product is linked to orders
      if (existingProduct.orderItems && existingProduct.orderItems.length > 0) {
        throw new BadRequestException(
          'Cannot delete product that is linked to existing orders. Use soft delete instead.',
        );
      }

      // Soft delete: mark as deleted
      return this.prisma.product.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
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
        'Failed to delete product: ' + error.message,
      );
    }
  }

  async restore(id: string): Promise<any> {
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

      if (!existingProduct.isDeleted) {
        throw new BadRequestException('Product is not deleted');
      }

      // Restore product
      return this.prisma.product.update({
        where: { id },
        data: {
          isDeleted: false,
          deletedAt: null,
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
        'Failed to restore product: ' + error.message,
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

      // Define resize options for product images
      const resizeOptions = { width: 800, height: 800 };
      const pathPrefix = `products/${productId}`;

      const uploadedImagesData =
        await this.fileUploadService.uploadMultipleImages(
          files,
          pathPrefix,
          resizeOptions,
        );

      const createdImages = await this.prisma.productImage.createMany({
        data: uploadedImagesData.map((img) => ({
          productId,
          url: img.url,
          altText: product.name,
        })),
      });

      return createdImages;
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

      const resizeOptions = { width: 800, height: 800 };
      const pathPrefix = 'products/temp';

      const uploadedImagesData =
        await this.fileUploadService.uploadMultipleImages(
          files,
          pathPrefix,
          resizeOptions,
        );

      return uploadedImagesData.map((result) => result.url);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to upload product images: ' + error.message,
      );
    }
  }

  async findBySlug(slug: string): Promise<any> {
    try {
      if (!slug) {
        throw new BadRequestException('Product slug is required');
      }

      const product = await this.prisma.product.findUnique({
        where: { slug, status: 'PUBLISHED' },
        select: {
          id: true,
          name: true,
          slug: true,
          shortDescription: true,
          longDescription: true,
          regularPrice: true,
          salePrice: true,
          stockQuantity: true,
          sku: true,
          averageRating: true,
          reviewCount: true,
          isFeatured: true,
          metaTitle: true,
          metaDescription: true,
          images: {
            select: {
              id: true,
              url: true,
              altText: true,
              isFeatured: true,
            },
            orderBy: { isFeatured: 'desc' },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          brand: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          variants: {
            select: {
              id: true,
              name: true,
              price: true,
              stockQuantity: true,
            },
          },
          reviews: {
            where: { status: 'APPROVED' },
            select: {
              id: true,
              rating: true,
              content: true,
              createdAt: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!product) {
        throw new NotFoundException(`Product with slug "${slug}" not found`);
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

  async findAllAdmin(filters?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<any> {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (filters?.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { sku: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      if (filters?.status) {
        where.status = filters.status;
      }

      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          include: {
            images: {
              where: { isFeatured: true },
              take: 1,
            },
            category: true,
            brand: true,
            variants: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.product.count({ where }),
      ]);

      return {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve admin products: ' + error.message,
      );
    }
  }

  async findDeletedProducts(): Promise<any[]> {
    try {
      return this.prisma.product.findMany({
        where: { isDeleted: true, includeDeleted: true } as any,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve deleted products: ' + error.message,
      );
    }
  }

  async restoreProduct(id: string): Promise<any> {
    try {
      if (!id) {
        throw new BadRequestException('Product ID is required');
      }

      // First, check if the product exists (even if soft-deleted)
      const product = await this.prisma.product.findUnique({
        where: { id, includeDeleted: true } as any,
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      // If it exists, update the isDeleted flag
      return this.prisma.product.update({
        where: { id },
        data: { isDeleted: false },
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to restore product: ' + error.message,
      );
    }
  }

  async forceDeleteProduct(id: string): Promise<{ message: string }> {
    try {
      if (!id) {
        throw new BadRequestException('Product ID is required');
      }

      // First, check if the product exists (even if soft-deleted)
      const product = await this.prisma.product.findUnique({
        where: { id, includeDeleted: true } as any,
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      // This will now be a hard delete because of the `forceDelete` flag
      await this.prisma.product.delete({
        where: { id, forceDelete: true } as any,
      });

      return { message: `Product ${id} permanently deleted.` };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to permanently delete product: ' + error.message,
      );
    }
  }
}
