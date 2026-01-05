import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async getUserWishlist(userId: string): Promise<any[]> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      const items = await this.prisma.wishlistItem.findMany({
        where: { userId },
        include: {
          product: {
            include: {
              category: true,
              brand: true,
            },
          },
          variant: {
            include: {
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return items;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve wishlist: ' + error.message,
      );
    }
  }

  async addToWishlist(
    userId: string,
    productId: string,
    variantId?: string,
  ): Promise<any> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }
      if (!productId) {
        throw new BadRequestException('Product ID is required');
      }

      // Check if product exists
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      // If variantId provided, check if it exists
      if (variantId) {
        const variant = await this.prisma.productVariant.findUnique({
          where: { id: variantId },
        });

        if (!variant) {
          throw new NotFoundException('Variant not found');
        }

        if (variant.productId !== productId) {
          throw new BadRequestException(
            'Variant does not belong to this product',
          );
        }
      }

      // Check if already in wishlist
      const existingItem = await this.prisma.wishlistItem.findFirst({
        where: {
          userId,
          productId,
          variantId: variantId || null,
        },
      });

      if (existingItem) {
        throw new ConflictException('Item already in wishlist');
      }

      const wishlistItem = await this.prisma.wishlistItem.create({
        data: {
          userId,
          productId,
          variantId: variantId || null,
        },
        include: {
          product: {
            include: {
              category: true,
              brand: true,
            },
          },
          variant: variantId
            ? {
                include: {
                  images: {
                    where: { isPrimary: true },
                    take: 1,
                  },
                },
              }
            : undefined,
        },
      });

      return wishlistItem;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to add to wishlist: ' + error.message,
      );
    }
  }

  async removeFromWishlist(
    userId: string,
    itemId: string,
  ): Promise<{ message: string }> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }
      if (!itemId) {
        throw new BadRequestException('Item ID is required');
      }

      const item = await this.prisma.wishlistItem.findFirst({
        where: {
          id: itemId,
          userId,
        },
      });

      if (!item) {
        throw new NotFoundException('Wishlist item not found');
      }

      await this.prisma.wishlistItem.delete({
        where: { id: itemId },
      });

      return { message: 'Item removed from wishlist' };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to remove from wishlist: ' + error.message,
      );
    }
  }

  async clearWishlist(userId: string): Promise<{ message: string }> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      await this.prisma.wishlistItem.deleteMany({
        where: { userId },
      });

      return { message: 'Wishlist cleared' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to clear wishlist: ' + error.message,
      );
    }
  }

  async isInWishlist(
    userId: string,
    productId: string,
    variantId?: string,
  ): Promise<{ inWishlist: boolean; itemId?: string }> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }
      if (!productId) {
        throw new BadRequestException('Product ID is required');
      }

      const item = await this.prisma.wishlistItem.findFirst({
        where: {
          userId,
          productId,
          variantId: variantId || null,
        },
      });

      return { inWishlist: !!item, itemId: item?.id };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to check wishlist status: ' + error.message,
      );
    }
  }
}
