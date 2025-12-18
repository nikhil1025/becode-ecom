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
              images: {
                where: { isFeatured: true },
                take: 1,
              },
              category: true,
              brand: true,
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

  async addToWishlist(userId: string, productId: string): Promise<any> {
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

      // Check if already in wishlist
      const existingItem = await this.prisma.wishlistItem.findUnique({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });

      if (existingItem) {
        throw new ConflictException('Product already in wishlist');
      }

      const wishlistItem = await this.prisma.wishlistItem.create({
        data: {
          userId,
          productId,
        },
        include: {
          product: {
            include: {
              images: {
                where: { isFeatured: true },
                take: 1,
              },
            },
          },
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
  ): Promise<{ inWishlist: boolean }> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }
      if (!productId) {
        throw new BadRequestException('Product ID is required');
      }

      const item = await this.prisma.wishlistItem.findUnique({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });

      return { inWishlist: !!item };
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
