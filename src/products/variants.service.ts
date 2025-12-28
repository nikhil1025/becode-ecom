import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { FileUploadService } from '../common/services/file-upload.service';
import { PrismaService } from '../prisma.service';
import {
  CreateVariantDto,
  PublicVariantDto,
  UpdateVariantDto,
  VariantResponseDto,
} from './dto/variant.dto';

@Injectable()
export class VariantsService {
  constructor(
    private prisma: PrismaService,
    private fileUploadService: FileUploadService,
  ) {}

  /**
   * Validate attributes object
   * - Keys must be strings
   * - Values must be string or number
   * - No nested objects
   */
  private validateAttributes(
    attributes: Record<string, any>,
  ): Record<string, string | number> {
    if (!attributes || typeof attributes !== 'object') {
      throw new BadRequestException('Attributes must be a valid object');
    }

    const validated: Record<string, string | number> = {};

    for (const [key, value] of Object.entries(attributes)) {
      if (typeof key !== 'string' || key.trim() === '') {
        throw new BadRequestException(
          'Attribute keys must be non-empty strings',
        );
      }

      if (typeof value !== 'string' && typeof value !== 'number') {
        throw new BadRequestException(
          `Attribute value for key "${key}" must be a string or number`,
        );
      }

      // Normalize key (lowercase, trim)
      const normalizedKey = key.trim().toLowerCase();
      validated[normalizedKey] = value;
    }

    if (Object.keys(validated).length === 0) {
      throw new BadRequestException('At least one attribute is required');
    }

    return validated;
  }

  /**
   * Check if SKU is unique
   */
  private async checkSkuUniqueness(
    sku: string,
    excludeVariantId?: string,
  ): Promise<void> {
    const whereClause: any = { sku };

    if (excludeVariantId) {
      whereClause.id = { not: excludeVariantId };
    }

    const existingVariant = await this.prisma.productVariant.findFirst({
      where: whereClause,
    });

    if (existingVariant) {
      throw new BadRequestException(`SKU "${sku}" is already in use`);
    }
  }

  /**
   * Create a new variant for a product
   */
  async createVariant(
    productId: string,
    createVariantDto: CreateVariantDto,
  ): Promise<VariantResponseDto> {
    try {
      // Validate product exists
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      // Validate attributes
      const validatedAttributes = this.validateAttributes(
        createVariantDto.attributes,
      );

      // Check SKU uniqueness
      await this.checkSkuUniqueness(createVariantDto.sku);

      // Create variant
      const variant = await this.prisma.productVariant.create({
        data: {
          productId,
          sku: createVariantDto.sku,
          name: createVariantDto.name,
          price: createVariantDto.price,
          stockQuantity: createVariantDto.stockQuantity,
          attributes: validatedAttributes as Prisma.JsonObject,
          isActive: createVariantDto.isActive ?? true,
        },
      });

      // Log audit
      await this.logAudit(
        'admin-user-id', // TODO: Get from request context
        'CREATE',
        'ProductVariant',
        variant.id,
        { created: variant },
      );

      return this.mapToResponseDto(variant);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create variant: ' + error.message,
      );
    }
  }

  /**
   * Get all variants for a product (Admin)
   */
  async getVariantsByProduct(productId: string): Promise<VariantResponseDto[]> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      const variants = await this.prisma.productVariant.findMany({
        where: { productId },
        include: {
          images: {
            orderBy: { position: 'asc' },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      return variants.map((v) => this.mapToResponseDto(v));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to fetch variants: ' + error.message,
      );
    }
  }

  /**
   * Get active variants for a product (Public)
   */
  async getPublicVariantsByProduct(
    productId: string,
  ): Promise<PublicVariantDto[]> {
    try {
      const variants = await this.prisma.productVariant.findMany({
        where: {
          productId,
          isActive: true,
          stockQuantity: { gt: 0 },
        },
        orderBy: { createdAt: 'asc' },
      });

      return variants.map((v) => this.mapToPublicDto(v));
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch variants: ' + error.message,
      );
    }
  }

  /**
   * Get a single variant by ID
   */
  async getVariantById(variantId: string): Promise<VariantResponseDto> {
    try {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: variantId },
        include: {
          images: {
            orderBy: { position: 'asc' },
          },
        },
      });

      if (!variant) {
        throw new NotFoundException('Variant not found');
      }

      return this.mapToResponseDto(variant);
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
   * Update a variant
   */
  async updateVariant(
    variantId: string,
    updateVariantDto: UpdateVariantDto,
  ): Promise<VariantResponseDto> {
    try {
      // Check if variant exists
      const existingVariant = await this.prisma.productVariant.findUnique({
        where: { id: variantId },
      });

      if (!existingVariant) {
        throw new NotFoundException('Variant not found');
      }

      // Validate attributes if provided
      let validatedAttributes: Record<string, string | number> | undefined;
      if (updateVariantDto.attributes) {
        validatedAttributes = this.validateAttributes(
          updateVariantDto.attributes,
        );
      }

      // Check SKU uniqueness ONLY if SKU is being changed to a different value
      if (updateVariantDto.sku) {
        const skuChanged = updateVariantDto.sku !== existingVariant.sku;
        if (skuChanged) {
          // New SKU provided - check if it's available
          await this.checkSkuUniqueness(updateVariantDto.sku, variantId);
        }
      }

      // Update variant
      const updatedVariant = await this.prisma.productVariant.update({
        where: { id: variantId },
        data: {
          sku: updateVariantDto.sku,
          name: updateVariantDto.name,
          price: updateVariantDto.price,
          stockQuantity: updateVariantDto.stockQuantity,
          attributes: validatedAttributes
            ? (validatedAttributes as Prisma.JsonObject)
            : undefined,
          isActive: updateVariantDto.isActive,
        },
      });

      // Log audit
      await this.logAudit(
        'admin-user-id', // TODO: Get from request context
        'UPDATE',
        'ProductVariant',
        variantId,
        { old: existingVariant, new: updatedVariant },
      );

      return this.mapToResponseDto(updatedVariant);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update variant: ' + error.message,
      );
    }
  }

  /**
   * Delete a variant (soft disable or hard delete)
   */
  async deleteVariant(variantId: string, force = false): Promise<void> {
    try {
      // Check if variant exists
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: variantId },
        include: {
          orderItems: true,
          cartItems: true,
        },
      });

      if (!variant) {
        throw new NotFoundException('Variant not found');
      }

      // Check if variant is linked to orders or active carts
      const hasActiveReferences =
        variant.orderItems.length > 0 || variant.cartItems.length > 0;

      if (hasActiveReferences && !force) {
        // Soft disable instead of delete
        await this.prisma.productVariant.update({
          where: { id: variantId },
          data: { isActive: false },
        });

        // Log audit
        await this.logAudit(
          'admin-user-id',
          'UPDATE',
          'ProductVariant',
          variantId,
          { action: 'soft_disabled', reason: 'has_active_references' },
        );

        throw new BadRequestException(
          'Variant is linked to orders/carts and has been disabled instead of deleted',
        );
      }

      // Hard delete
      await this.prisma.productVariant.delete({
        where: { id: variantId },
      });

      // Log audit
      await this.logAudit(
        'admin-user-id',
        'DELETE',
        'ProductVariant',
        variantId,
        { deleted: variant },
      );
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to delete variant: ' + error.message,
      );
    }
  }

  /**
   * Check if variant is available for purchase
   */
  async isVariantAvailable(variantId: string): Promise<boolean> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    return variant !== null && variant.isActive && variant.stockQuantity > 0;
  }

  /**
   * Validate variant for cart/checkout
   */
  async validateVariantForPurchase(
    variantId: string,
    quantity: number,
  ): Promise<{ valid: boolean; message?: string; availableStock?: number }> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      return { valid: false, message: 'Variant not found' };
    }

    if (!variant.isActive) {
      return { valid: false, message: 'Variant is not available' };
    }

    if (variant.stockQuantity < quantity) {
      return {
        valid: false,
        message: `Insufficient stock. Only ${variant.stockQuantity} available`,
        availableStock: variant.stockQuantity,
      };
    }

    return { valid: true };
  }

  /**
   * Map to response DTO
   */
  private mapToResponseDto(variant: any): VariantResponseDto {
    return {
      id: variant.id,
      productId: variant.productId,
      sku: variant.sku,
      name: variant.name,
      price: variant.price,
      stockQuantity: variant.stockQuantity,
      attributes: variant.attributes as Record<string, string | number>,
      isActive: variant.isActive,
      images: variant.images || [],
      createdAt: variant.createdAt,
      updatedAt: variant.updatedAt,
    };
  }

  /**
   * Map to public DTO
   */
  private mapToPublicDto(variant: any): PublicVariantDto {
    return {
      id: variant.id,
      sku: variant.sku,
      name: variant.name,
      price: variant.price,
      stockQuantity: variant.stockQuantity,
      attributes: variant.attributes as Record<string, string | number>,
      isActive: variant.isActive,
    };
  }

  /**
   * Log audit entry
   */
  private async logAudit(
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    changes: any,
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          entityType,
          entityId,
          changes,
        },
      });
    } catch (error) {
      // Don't fail the main operation if audit logging fails
      console.error('Failed to log audit:', error);
    }
  }

  /**
   * Upload images for a variant
   */
  async uploadVariantImages(
    variantId: string,
    files: Express.Multer.File[],
  ): Promise<any> {
    try {
      if (!files || files.length === 0) {
        throw new BadRequestException('No files uploaded');
      }

      // Verify variant exists
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: variantId },
        include: { images: true },
      });

      if (!variant) {
        throw new NotFoundException('Variant not found');
      }

      // Check image limit (max 10 per variant)
      if (variant.images.length + files.length > 10) {
        throw new BadRequestException(
          `Cannot upload ${files.length} images. Maximum 10 images per variant (currently ${variant.images.length})`,
        );
      }

      // Upload images
      const resizeOptions = { width: 800, height: 800 };
      const pathPrefix = `products/variants/${variantId}`;

      const uploadedImages = await this.fileUploadService.uploadMultipleImages(
        files,
        pathPrefix,
        resizeOptions,
      );

      // Get the current max position
      const maxPosition =
        variant.images.length > 0
          ? Math.max(...variant.images.map((img) => img.position))
          : -1;

      // Create image records
      const imageRecords = await Promise.all(
        uploadedImages.map((uploadResult, index) =>
          this.prisma.productImage.create({
            data: {
              variantId,
              url: uploadResult.url,
              altText: uploadResult.key || `Image ${index + 1}`,
              position: maxPosition + index + 1,
              isPrimary: variant.images.length === 0 && index === 0, // First image is primary if no images exist
            },
          }),
        ),
      );

      return {
        message: 'Images uploaded successfully',
        images: imageRecords,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to upload variant images: ' + error.message,
      );
    }
  }

  /**
   * Delete a variant image
   */
  async deleteVariantImage(variantId: string, imageId: string): Promise<void> {
    try {
      // Verify image exists and belongs to the variant
      const image = await this.prisma.productImage.findFirst({
        where: {
          id: imageId,
          variantId,
        },
      });

      if (!image) {
        throw new NotFoundException(
          'Image not found or does not belong to this variant',
        );
      }

      // Delete the image record from database
      // Note: Physical file deletion from S3 can be handled separately via cleanup job
      await this.prisma.productImage.delete({
        where: { id: imageId },
      });

      // If deleted image was primary, set another image as primary
      if (image.isPrimary) {
        const remainingImages = await this.prisma.productImage.findMany({
          where: { variantId },
          orderBy: { position: 'asc' },
          take: 1,
        });

        if (remainingImages.length > 0) {
          await this.prisma.productImage.update({
            where: { id: remainingImages[0].id },
            data: { isPrimary: true },
          });
        }
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to delete variant image: ' + error.message,
      );
    }
  }
}
