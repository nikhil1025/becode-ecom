import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { FileUploadService } from '../common/services/file-upload.service';
import { PrismaService } from '../prisma.service';

export interface VariantListingFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  attributes?: Record<string, string | number>;
  productId?: string;
  inStock?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface VariantListingItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  sku: string;
  variantName: string;
  price: number;
  salePrice?: number | null;
  discount?: number;
  stockQuantity: number;
  attributes: Record<string, string | number>;
  primaryImage?: string;
  images: Array<{ id: string; url: string; altText?: string }>;
  category: { id: string; name: string; slug: string };
  brand?: { id: string; name: string; slug: string };
  isActive: boolean;
  isFeatured?: boolean;
  collectionName?: string | null;
}

export interface VariantImageDto {
  url: string;
  altText?: string;
  position?: number;
  isPrimary?: boolean;
}

@Injectable()
export class VariantsListingService {
  constructor(
    private prisma: PrismaService,
    private fileUploadService: FileUploadService,
  ) {}

  /**
   * PUBLIC: Get variant listings for category pages, search, etc.
   * This is the primary listing endpoint for frontend
   */
  async getVariantListings(filters: VariantListingFilters): Promise<{
    variants: VariantListingItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      // Build where clause
      const where: Prisma.ProductVariantWhereInput = {
        isActive: true,
        stockQuantity: filters.inStock ? { gt: 0 } : undefined,
        product: {
          status: 'PUBLISHED',
          isDeleted: false,
          category: filters.category ? { slug: filters.category } : undefined,
        },
      };

      // Price filters
      if (filters.minPrice || filters.maxPrice) {
        where.price = {};
        if (filters.minPrice) where.price.gte = filters.minPrice;
        if (filters.maxPrice) where.price.lte = filters.maxPrice;
      }

      // Product search (searches within product names)
      if (filters.search) {
        where.product = {
          ...where.product,
        };
        if (!where.product.OR) {
          where.product.OR = [];
        }
        where.product.OR.push(
          { name: { contains: filters.search, mode: 'insensitive' } },
          {
            shortDescription: {
              contains: filters.search,
              mode: 'insensitive',
            },
          },
        );
      }

      // Attribute filters
      if (filters.attributes) {
        // Filter variants by attributes
        where.attributes = {
          path: Object.keys(filters.attributes),
          string_contains: Object.values(filters.attributes)[0] as string,
        };
      }

      // Specific product
      if (filters.productId) {
        where.productId = filters.productId;
      }

      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      // Sorting
      const sortBy = filters.sortBy || 'createdAt';
      const sortOrder = filters.sortOrder || 'desc';
      const orderBy: Prisma.ProductVariantOrderByWithRelationInput = {};
      if (sortBy === 'price') {
        orderBy.price = sortOrder;
      } else if (sortBy === 'name') {
        orderBy.name = sortOrder;
      } else {
        orderBy.createdAt = sortOrder;
      }

      // Execute queries
      const [variants, total] = await Promise.all([
        this.prisma.productVariant.findMany({
          where,
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                isFeatured: true,
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
            },
            images: {
              orderBy: [{ isPrimary: 'desc' }, { position: 'asc' }],
              select: {
                id: true,
                url: true,
                altText: true,
                isPrimary: true,
              },
            },
          },
          orderBy,
          skip,
          take: limit,
        }),
        this.prisma.productVariant.count({ where }),
      ]);

      // Transform to listing items
      type VariantWithIncludes = (typeof variants)[number];
      const variantListings: VariantListingItem[] = variants.map(
        (variant: VariantWithIncludes) => {
          const primaryImage = variant.images.find((img) => img.isPrimary);
          const discount =
            variant.salePrice && variant.price
              ? Math.round(
                  ((variant.price - variant.salePrice) / variant.price) * 100,
                )
              : 0;

          return {
            id: variant.id,
            productId: variant.product.id,
            productName: variant.product.name,
            productSlug: variant.product.slug,
            sku: variant.sku,
            variantName: variant.name,
            price: variant.salePrice || variant.price,
            salePrice: variant.salePrice,
            discount,
            stockQuantity: variant.stockQuantity,
            attributes: variant.attributes as Record<string, string | number>,
            primaryImage: primaryImage?.url || variant.images[0]?.url,
            images: variant.images.map((img) => ({
              id: img.id,
              url: img.url,
              altText: img.altText || variant.name,
            })),
            category: variant.product.category,
            brand: variant.product.brand || undefined,
            isActive: variant.isActive,
            isFeatured: variant.product.isFeatured,
            collectionName:
              variant.product.collectionProducts?.[0]?.collection?.name || null,
          };
        },
      );

      return {
        variants: variantListings,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch variant listings: ' + error.message,
      );
    }
  }

  /**
   * Get single variant for PDP with all details
   */
  async getVariantById(variantId: string): Promise<any> {
    try {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: variantId },
        include: {
          product: {
            include: {
              category: true,
              brand: true,
            },
          },
          images: {
            orderBy: [{ isPrimary: 'desc' }, { position: 'asc' }],
          },
        },
      });

      if (!variant) {
        throw new NotFoundException('Variant not found');
      }

      return variant;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to fetch variant: ' + error.message,
      );
    }
  }

  /**
   * ADMIN: Add images to a variant
   */
  async addVariantImages(
    variantId: string,
    images: VariantImageDto[],
  ): Promise<void> {
    try {
      // Check variant exists
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: variantId },
      });

      if (!variant) {
        throw new NotFoundException('Variant not found');
      }

      // If setting a new primary image, unset old primary
      const hasPrimary = images.some((img) => img.isPrimary);
      if (hasPrimary) {
        await this.prisma.productImage.updateMany({
          where: { variantId },
          data: { isPrimary: false },
        });
      }

      // Add images
      await Promise.all(
        images.map((img, index) =>
          this.prisma.productImage.create({
            data: {
              variantId,
              url: img.url,
              altText: img.altText || variant.name,
              position: img.position !== undefined ? img.position : index,
              isPrimary: img.isPrimary || false,
            },
          }),
        ),
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to add variant images: ' + error.message,
      );
    }
  }

  /**
   * ADMIN: Delete variant image
   */
  async deleteVariantImage(imageId: string): Promise<void> {
    try {
      const image = await this.prisma.productImage.findUnique({
        where: { id: imageId },
      });

      if (!image) {
        throw new NotFoundException('Image not found');
      }

      // Delete file from storage
      // TODO: Implement deleteFile method in FileUploadService
      // await this.fileUploadService.deleteFile(image.url);

      // Delete from database
      await this.prisma.productImage.delete({
        where: { id: imageId },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to delete image: ' + error.message,
      );
    }
  }

  /**
   * ADMIN: Set primary image for variant
   */
  async setPrimaryImage(variantId: string, imageId: string): Promise<void> {
    try {
      // Unset all primary images for this variant
      await this.prisma.productImage.updateMany({
        where: { variantId },
        data: { isPrimary: false },
      });

      // Set new primary
      await this.prisma.productImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to set primary image: ' + error.message,
      );
    }
  }

  /**
   * Get available variants for a product (for PDP variant selector)
   */
  async getProductVariants(productId: string): Promise<any[]> {
    try {
      const variants = await this.prisma.productVariant.findMany({
        where: {
          productId,
          isActive: true,
        },
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      return variants;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch product variants: ' + error.message,
      );
    }
  }

  /**
   * Validate variant stock for cart/checkout
   */
  async validateVariantStock(
    variantId: string,
    requestedQuantity: number,
  ): Promise<{
    valid: boolean;
    message?: string;
    availableStock?: number;
    variant?: any;
  }> {
    try {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: variantId },
      });

      if (!variant) {
        return { valid: false, message: 'Variant not found' };
      }

      if (!variant.isActive) {
        return { valid: false, message: 'This variant is no longer available' };
      }

      if (variant.stockQuantity < requestedQuantity) {
        return {
          valid: false,
          message: `Insufficient stock. Only ${variant.stockQuantity} available`,
          availableStock: variant.stockQuantity,
        };
      }

      return { valid: true, variant };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to validate variant stock: ' + error.message,
      );
    }
  }
}
