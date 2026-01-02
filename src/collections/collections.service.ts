import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FileUploadService } from '../common/services/file-upload.service';
import { PrismaService } from '../prisma.service';
import {
  AddProductsToCollectionDto,
  RemoveProductsFromCollectionDto,
  ReorderProductsDto,
} from './dto/add-products-to-collection.dto';
import {
  CollectionFiltersDto,
  CollectionProductFiltersDto,
} from './dto/collection-filters.dto';
import {
  CollectionStatus,
  CreateCollectionDto,
  DiscountType,
} from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Injectable()
export class CollectionsService {
  constructor(
    private prisma: PrismaService,
    private fileUploadService: FileUploadService,
  ) {}

  /**
   * Generate unique slug from name
   */
  async generateSlug(name: string): Promise<string> {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    let slug = baseSlug;
    let counter = 1;

    while (await this.prisma.collection.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Validate date range
   */
  private checkDateRange(startDate?: Date, endDate?: Date): void {
    if (startDate && endDate && endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }
  }

  /**
   * Validate discount value based on type
   */
  private validateDiscount(
    discountType?: DiscountType,
    discountValue?: number,
  ): void {
    if (discountType && discountValue !== undefined && discountValue !== null) {
      if (discountValue < 0) {
        throw new BadRequestException('Discount value cannot be negative');
      }
      if (discountType === DiscountType.PERCENTAGE && discountValue > 100) {
        throw new BadRequestException('Percentage discount cannot exceed 100%');
      }
    }
  }

  /**
   * Upload banner image to S3
   */
  async uploadBannerImage(file: Express.Multer.File): Promise<string> {
    const { url } = await this.fileUploadService.uploadImage(
      file,
      'collections',
      { width: 1920, height: 600 }, // Banner image dimensions
    );
    return url;
  }

  /**
   * Create a new collection
   */
  async create(dto: CreateCollectionDto) {
    // Validate discount
    this.validateDiscount(dto.discountType, dto.discountValue);

    // Validate date range
    this.checkDateRange(dto.startDate, dto.endDate);

    // Generate unique slug
    const slug = await this.generateSlug(dto.name);

    // Create collection
    const collection = await this.prisma.collection.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        bannerImage: dto.bannerImage,
        offerText: dto.offerText,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        status: dto.status || CollectionStatus.DRAFT,
        priority: dto.priority || 0,
        startDate: dto.startDate,
        endDate: dto.endDate,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
      },
    });

    return collection;
  }

  /**
   * Find all collections with filters and pagination
   */
  async findAll(filters: CollectionFiltersDto, isPublic: boolean = false) {
    const where: any = {};

    // Public view: only published, non-deleted, active collections
    if (isPublic) {
      where.status = CollectionStatus.PUBLISHED;
      where.isDeleted = false;
      // Note: We don't filter by startDate/endDate here
      // Published collections are visible regardless of dates
      // Dates are used for display purposes (badges, countdowns) in the UI
    } else {
      // Admin view: apply filters
      if (filters.status) {
        where.status = filters.status;
      }

      if (!filters.includeDeleted) {
        where.isDeleted = false;
      }
    }

    // Search filter
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { offerText: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const [collections, total] = await Promise.all([
      this.prisma.collection.findMany({
        where,
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.collection.count({ where }),
    ]);

    // Transform to add productCount
    const transformedCollections = collections.map((collection) => ({
      ...collection,
      productCount: collection._count.products,
      _count: undefined,
    }));

    return {
      collections: transformedCollections,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find one collection by ID or slug
   */
  async findOne(idOrSlug: string, isPublic: boolean = false) {
    const where: any = {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    };

    if (isPublic) {
      where.status = CollectionStatus.PUBLISHED;
      where.isDeleted = false;
      // Note: We don't filter by startDate/endDate here
      // Published collections are visible regardless of dates
      // Dates are used for display purposes (badges, countdowns) in the UI
    }

    const collection = await this.prisma.collection.findFirst({
      where,
      include: {
        products: {
          where: { isActive: true },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                status: true,
                isFeatured: true,
                category: {
                  select: { id: true, name: true },
                },
                brand: {
                  select: { id: true, name: true },
                },
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                salePrice: true,
                stockQuantity: true,
                isActive: true,
                images: {
                  where: { isPrimary: true },
                  take: 1,
                  select: {
                    id: true,
                    url: true,
                    altText: true,
                    isPrimary: true,
                  },
                },
              },
            },
          },
          orderBy: { position: 'asc' },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    return {
      ...collection,
      productCount: collection._count.products,
      _count: undefined,
    };
  }

  /**
   * Update a collection
   */
  async update(id: string, dto: UpdateCollectionDto) {
    // Check if collection exists
    const existing = await this.prisma.collection.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Collection not found');
    }

    // Validate discount if provided
    this.validateDiscount(dto.discountType, dto.discountValue);

    // Validate date range if provided
    this.checkDateRange(dto.startDate, dto.endDate);

    // Generate new slug if name changed
    let slug = existing.slug;
    if (dto.name && dto.name !== existing.name) {
      slug = await this.generateSlug(dto.name);
    }

    // Update collection
    const updated = await this.prisma.collection.update({
      where: { id },
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        bannerImage: dto.bannerImage,
        offerText: dto.offerText,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        status: dto.status,
        priority: dto.priority,
        startDate: dto.startDate,
        endDate: dto.endDate,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return {
      ...updated,
      productCount: updated._count.products,
      _count: undefined,
    };
  }

  /**
   * Soft delete a collection
   */
  async delete(id: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    await this.prisma.collection.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return { message: 'Collection deleted successfully' };
  }

  /**
   * Restore a soft-deleted collection
   */
  async restore(id: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    if (!collection.isDeleted) {
      throw new BadRequestException('Collection is not deleted');
    }

    const restored = await this.prisma.collection.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return restored;
  }

  /**
   * Add products to collection
   */
  async addProducts(collectionId: string, dto: AddProductsToCollectionDto) {
    // Validate collection exists
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    // Validate all unique products exist
    const uniqueProductIds = [...new Set(dto.products.map((p) => p.productId))];
    const existingProducts = await this.prisma.product.findMany({
      where: { id: { in: uniqueProductIds } },
      select: { id: true },
    });

    if (existingProducts.length !== uniqueProductIds.length) {
      throw new BadRequestException('One or more products not found');
    }

    // Validate all variants exist (if variantIds provided)
    const variantIds = dto.products
      .map((p) => p.variantId)
      .filter((id) => id !== null && id !== undefined);

    if (variantIds.length > 0) {
      const existingVariants = await this.prisma.productVariant.findMany({
        where: { id: { in: variantIds as string[] } },
        select: { id: true },
      });

      if (existingVariants.length !== variantIds.length) {
        throw new BadRequestException('One or more variants not found');
      }
    }

    // Check for duplicates
    const existingCollectionProducts =
      await this.prisma.collectionProduct.findMany({
        where: {
          collectionId,
          OR: dto.products.map((p) => ({
            productId: p.productId,
            variantId: p.variantId || null,
          })),
        },
      });

    if (existingCollectionProducts.length > 0) {
      throw new ConflictException(
        'One or more products are already in this collection',
      );
    }

    // Get current max position
    const maxPosition = await this.prisma.collectionProduct.findFirst({
      where: { collectionId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const startPosition = (maxPosition?.position || -1) + 1;

    // Add products
    const collectionProducts = await this.prisma.collectionProduct.createMany({
      data: dto.products.map((p, index) => ({
        collectionId,
        productId: p.productId,
        variantId: p.variantId,
        isActive: p.isActive !== undefined ? p.isActive : true,
        position: startPosition + index,
      })),
    });

    return {
      message: 'Products added successfully',
      addedCount: collectionProducts.count,
    };
  }

  /**
   * Remove products from collection
   */
  async removeProducts(
    collectionId: string,
    dto: RemoveProductsFromCollectionDto,
  ) {
    const where: any = {
      collectionId,
      productId: { in: dto.productIds },
    };

    if (dto.variantIds && dto.variantIds.length > 0) {
      where.variantId = { in: dto.variantIds };
    }

    const result = await this.prisma.collectionProduct.deleteMany({ where });

    return {
      message: 'Products removed successfully',
      removedCount: result.count,
    };
  }

  /**
   * Reorder collection products
   */
  async reorderProducts(collectionId: string, dto: ReorderProductsDto) {
    // Validate collection exists
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    // Update positions in a transaction
    await this.prisma.$transaction(
      dto.productOrder.map((item) =>
        this.prisma.collectionProduct.update({
          where: { id: item.id },
          data: { position: item.position },
        }),
      ),
    );

    return { message: 'Products reordered successfully' };
  }

  /**
   * Get collection products with filters
   */
  async getCollectionProducts(
    idOrSlug: string,
    filters: CollectionProductFiltersDto,
  ) {
    // Find collection
    const collection = await this.findOne(idOrSlug, true);

    // Build where clause for products
    const where: any = {
      collectionId: collection.id,
      isActive: true,
      product: {
        status: 'PUBLISHED',
        isDeleted: false,
      },
    };

    // Apply filters
    if (filters.category) {
      where.product.categoryId = filters.category;
    }

    if (filters.brand) {
      where.product.brandId = filters.brand;
    }

    if (filters.inStock) {
      where.variant = {
        stockQuantity: { gt: 0 },
      };
    }

    // Price range filter
    if (filters.minPrice || filters.maxPrice) {
      where.variant = where.variant || {};
      if (filters.minPrice) {
        where.variant.price = { gte: filters.minPrice };
      }
      if (filters.maxPrice) {
        where.variant.price = {
          ...where.variant.price,
          lte: filters.maxPrice,
        };
      }
    }

    // Sorting
    let orderBy: any = { position: 'asc' };
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-asc':
          orderBy = { variant: { price: 'asc' } };
          break;
        case 'price-desc':
          orderBy = { variant: { price: 'desc' } };
          break;
        case 'newest':
          orderBy = { addedAt: 'desc' };
          break;
      }
    }

    const page = filters.page || 1;
    const limit = filters.limit || 24;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.collectionProduct.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              isFeatured: true,
              category: {
                select: { id: true, name: true },
              },
              brand: {
                select: { id: true, name: true },
              },
            },
          },
          variant: {
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
              },
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.collectionProduct.count({ where }),
    ]);

    // Calculate discounted prices
    const productsWithDiscount = products.map((item) => {
      const originalPrice = item.variant?.salePrice || item.variant?.price || 0;
      const discountedPrice = this.calculateDiscountedPrice(
        originalPrice,
        collection,
      );
      const savings = originalPrice - discountedPrice;
      const discountPercentage =
        originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0;

      return {
        ...item,
        originalPrice,
        discountedPrice,
        savings,
        discountPercentage,
      };
    });

    // Get available categories and brands for filtering
    const [categories, brands] = await Promise.all([
      this.prisma.collectionProduct
        .findMany({
          where: { collectionId: collection.id, isActive: true },
          include: {
            product: {
              select: {
                category: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        })
        .then((items) => {
          const uniqueCategories = new Map();
          items.forEach((item) => {
            if (item.product.category) {
              uniqueCategories.set(
                item.product.category.id,
                item.product.category,
              );
            }
          });
          return Array.from(uniqueCategories.values());
        }),
      this.prisma.collectionProduct
        .findMany({
          where: { collectionId: collection.id, isActive: true },
          include: {
            product: {
              select: {
                brand: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        })
        .then((items) => {
          const uniqueBrands = new Map();
          items.forEach((item) => {
            if (item.product.brand) {
              uniqueBrands.set(item.product.brand.id, item.product.brand);
            }
          });
          return Array.from(uniqueBrands.values());
        }),
    ]);

    return {
      products: productsWithDiscount,
      categories,
      brands,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Calculate discounted price based on collection discount
   */
  calculateDiscountedPrice(price: number, collection: any): number {
    if (!collection.discountValue || collection.discountValue === 0) {
      return price;
    }

    let discountedPrice = price;

    if (collection.discountType === DiscountType.PERCENTAGE) {
      discountedPrice = price * (1 - collection.discountValue / 100);
    } else if (collection.discountType === DiscountType.FIXED) {
      discountedPrice = price - collection.discountValue;
    }

    // Ensure price doesn't go negative
    return Math.max(0, discountedPrice);
  }

  /**
   * Search products for selection in admin (optimized for dropdown)
   */
  async searchProductsForSelection(query: string, collectionId?: string) {
    if (!query || query.length < 2) {
      return [];
    }

    const products = await this.prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { sku: { contains: query, mode: 'insensitive' } },
          {
            variants: {
              some: {
                OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { sku: { contains: query, mode: 'insensitive' } },
                ],
              },
            },
          },
        ],
        status: 'PUBLISHED',
        isDeleted: false,
      },
      include: {
        variants: {
          where: { isActive: true },
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
        brand: {
          select: { id: true, name: true },
        },
        category: {
          select: { id: true, name: true },
        },
      },
      take: 20,
    });

    // Get already added products if collectionId provided
    let addedProductIds: string[] = [];
    if (collectionId) {
      const addedProducts = await this.prisma.collectionProduct.findMany({
        where: { collectionId },
        select: { productId: true, variantId: true },
      });
      addedProductIds = addedProducts.map(
        (p) => `${p.productId}-${p.variantId || ''}`,
      );
    }

    // Transform for frontend
    return products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      thumbnail:
        product.variants[0]?.images[0]?.url || '/placeholder-product.jpg',
      price: product.variants[0]?.price || 0,
      salePrice: product.variants[0]?.salePrice,
      stockQuantity: product.variants[0]?.stockQuantity || 0,
      brand: product.brand?.name,
      category: product.category?.name,
      variants: product.variants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        sku: variant.sku,
        price: variant.price,
        salePrice: variant.salePrice,
        stockQuantity: variant.stockQuantity,
        thumbnail: variant.images[0]?.url || '/placeholder-product.jpg',
        isAlreadyAdded: addedProductIds.includes(`${product.id}-${variant.id}`),
      })),
      isAlreadyAdded: addedProductIds.includes(`${product.id}-`),
    }));
  }

  /**
   * Update collection status
   */
  async updateStatus(id: string, status: CollectionStatus) {
    // Validate if publishing
    if (status === CollectionStatus.PUBLISHED) {
      await this.validateCollectionForPublishing(id);
    }

    const updated = await this.prisma.collection.update({
      where: { id },
      data: { status },
    });

    return updated;
  }

  /**
   * Validate collection is ready for publishing
   */
  async validateCollectionForPublishing(id: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    const errors: string[] = [];

    // Check if has at least one product
    if (collection._count.products === 0) {
      errors.push('Collection must have at least one product');
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Collection validation failed',
        errors,
      });
    }

    return true;
  }

  /**
   * Get active collections (for homepage)
   */
  async getActiveCollections() {
    const now = new Date();

    const collections = await this.prisma.collection.findMany({
      where: {
        status: CollectionStatus.PUBLISHED,
        isDeleted: false,
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: now }, endDate: null },
          { startDate: null, endDate: { gte: now } },
          { startDate: { lte: now }, endDate: { gte: now } },
        ],
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { priority: 'asc' },
      take: 10,
    });

    return collections.map((collection) => ({
      ...collection,
      productCount: collection._count.products,
      _count: undefined,
    }));
  }
}
