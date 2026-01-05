import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FileUploadService } from '../common/services/file-upload.service';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private fileUploadService: FileUploadService,
  ) {}

  async findAll(filters?: {
    category?: string;
    search?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
  }): Promise<any> {
    try {
      const where: any = {
        status: 'PUBLISHED',
        isDeleted: false,
      };

      if (filters?.category) {
        where.category = { slug: filters.category };
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
            averageRating: true,
            reviewCount: true,
            isFeatured: true,
            longDescription: true,
            shortDescription: true,
            sku: true,
            status: true,
            _count: {
              select: {
                variants: {
                  where: {
                    isActive: true,
                  },
                },
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

      // Transform to match expected structure
      const transformedProducts = products.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        averageRating: product.averageRating,
        reviewCount: product.reviewCount,
        isFeatured: product.isFeatured,
        category: product.category,
        brand: product.brand,
        shortDescription: product.shortDescription,
        longDescription: product.longDescription,
        sku: product.sku,
        status: product.status,
        variantCount: product._count.variants,
        hasVariants: product._count.variants > 0,
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

      const product = await this.prisma.product.findFirst({
        where: {
          isDeleted: false,
          OR: [{ id: id }, { slug: id }],
        },
        include: {
          category: true,
          brand: true,
          variants: {
            where: {
              isActive: true,
            },
            include: {
              images: {
                orderBy: { position: 'asc' },
              },
            },
          },
          reviews: {
            where: { status: 'APPROVED' },
            include: { user: { select: { firstName: true, lastName: true } } },
          },
          collectionProducts: {
            where: {
              isActive: true,
              collection: {
                startDate: { lte: new Date() },
                endDate: { gte: new Date() },
              },
            },
            select: {
              collection: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
            take: 1,
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

  async findOneForAdmin(id: string): Promise<any> {
    try {
      if (!id) {
        throw new BadRequestException('Product ID is required');
      }

      const product = await this.prisma.product.findUnique({
        where: {
          id,
          isDeleted: false,
        },
        include: {
          category: true,
          brand: true,
          variants: {
            // Admin sees ALL variants (active + inactive)
            include: {
              images: {
                orderBy: { position: 'asc' },
              },
            },
          },
          reviews: {
            // Admin sees ALL reviews (pending, approved, rejected)
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
        'Failed to retrieve product for admin: ' + error.message,
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
      if (!data.categoryId) {
        throw new BadRequestException('Product category is required');
      }

      // Map DTO fields to Prisma schema fields
      const { description, images, variants, specifications, tags, ...rest } =
        data;
      const prismaData: any = {
        ...rest,
        longDescription: description,
      };

      // Remove undefined fields
      Object.keys(prismaData).forEach((key) => {
        if (prismaData[key] === undefined) {
          delete prismaData[key];
        }
      });

      // Ensure categoryId is properly set
      if (!prismaData.categoryId) {
        throw new BadRequestException('Category ID is required');
      }

      return this.prisma.product.create({
        data: prismaData,
        include: {
          category: true,
          brand: true,
          variants: true,
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

      const existingProduct = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      // CRITICAL: Enforce variant requirement when publishing
      if (data.status === 'PUBLISHED') {
        const variantCount = await this.prisma.productVariant.count({
          where: {
            productId: id,
            isActive: true,
          },
        });

        if (variantCount === 0) {
          throw new BadRequestException(
            'Cannot publish product without at least one active variant. Please create variants first.',
          );
        }
      }

      // Map DTO fields to Prisma schema fields
      const { description, images, variants, specifications, tags, ...rest } =
        data;
      const prismaData: any = { ...rest };

      if (description !== undefined) prismaData.longDescription = description;

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
          category: true,
          brand: true,
          variants: true,
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

      // Images are now managed at variant level, not product level
      // This endpoint is deprecated - use variant image upload instead
      throw new BadRequestException(
        'Product images are managed at the variant level. Please use the variant image upload endpoint.',
      );
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

      // Single query to find by either ID or slug using OR condition
      const product = await this.prisma.product.findFirst({
        where: {
          status: 'PUBLISHED',
          OR: [{ id: slug }, { slug: slug }],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          shortDescription: true,
          longDescription: true,
          sku: true,
          averageRating: true,
          reviewCount: true,
          isFeatured: true,
          metaTitle: true,
          metaDescription: true,
          status: true,
          variants: {
            select: {
              id: true,
              name: true,
              sku: true,
              price: true,
              salePrice: true,
              stockQuantity: true,
              isActive: true,
              attributes: true,
              images: {
                select: {
                  id: true,
                  url: true,
                  altText: true,
                  isPrimary: true,
                },
                orderBy: { isPrimary: 'desc' },
              },
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
        throw new NotFoundException(
          `Product with identifier "${slug}" not found`,
        );
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
    includeDeleted?: boolean;
  }): Promise<any> {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const skip = (page - 1) * limit;

      const where: any = {};

      // By default, exclude deleted products unless explicitly requested
      if (filters?.includeDeleted) {
        where.isDeleted = true; // Show ONLY deleted products
      } else {
        where.isDeleted = false; // Show only non-deleted products
      }

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
            category: true,
            brand: true,
            variants: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
            _count: {
              select: {
                variants: {
                  where: { isActive: true },
                },
              },
            },
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

  /**
   * Validate that product has at least one variant before publishing
   * @param productId Product ID to validate
   * @returns true if valid, throws exception if invalid
   */
  async validateProductForPublishing(productId: string): Promise<boolean> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        include: {
          variants: {
            where: { isActive: true },
          },
        },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }

      if (!product.variants || product.variants.length === 0) {
        throw new BadRequestException(
          'Product cannot be published without at least one active variant',
        );
      }

      return true;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to validate product: ' + error.message,
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

  async searchProducts(query?: string): Promise<any> {
    try {
      const where: any = {
        status: 'PUBLISHED',
        isDeleted: false,
      };

      if (query) {
        where.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { sku: { contains: query, mode: 'insensitive' } },
        ];
      }

      return await this.prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          sku: true,
          slug: true,
          status: true,
          category: {
            select: { id: true, name: true, slug: true },
          },
          variants: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              sku: true,
              price: true,
              salePrice: true,
              stockQuantity: true,
              images: {
                where: { isPrimary: true },
                take: 1,
                select: { url: true, altText: true },
              },
            },
          },
        },
        take: 20,
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to search products');
    }
  }
}
