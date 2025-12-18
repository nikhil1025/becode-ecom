import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string): Promise<any> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      let cart = await this.prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
              variant: true,
            },
          },
        },
      });

      if (!cart) {
        cart = await this.prisma.cart.create({
          data: { userId },
          include: {
            items: {
              include: {
                product: {
                  include: {
                    images: true,
                  },
                },
                variant: true,
              },
            },
          },
        });
      }

      return cart;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve cart: ' + error.message,
      );
    }
  }

  async addItem(
    userId: string,
    productId: string,
    quantity: number,
    variantId?: string,
  ): Promise<any> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }
      if (!productId) {
        throw new BadRequestException('Product ID is required');
      }
      if (!quantity || quantity < 1) {
        throw new BadRequestException('Quantity must be at least 1');
      }

      const cart = await this.getCart(userId);

      const existingItem = await this.prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
        },
      });

      if (existingItem) {
        return this.prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
          include: {
            product: {
              include: {
                images: true,
              },
            },
            variant: true,
          },
        });
      }

      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      const price = product.salePrice || product.regularPrice;

      return this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId,
          quantity,
          price,
        },
        include: {
          product: {
            include: {
              images: true,
            },
          },
          variant: true,
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
        'Failed to add item to cart: ' + error.message,
      );
    }
  }

  async updateItem(
    userId: string,
    itemId: string,
    quantity: number,
  ): Promise<any> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }
      if (!itemId) {
        throw new BadRequestException('Item ID is required');
      }
      if (!quantity || quantity < 1) {
        throw new BadRequestException('Quantity must be at least 1');
      }

      const cart = await this.getCart(userId);

      const existingItem = await this.prisma.cartItem.findFirst({
        where: {
          id: itemId,
          cartId: cart.id,
        },
      });

      if (!existingItem) {
        throw new NotFoundException('Cart item not found');
      }

      return this.prisma.cartItem.update({
        where: {
          id: itemId,
          cartId: cart.id,
        },
        data: { quantity },
        include: {
          product: {
            include: {
              images: true,
            },
          },
          variant: true,
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
        'Failed to update cart item: ' + error.message,
      );
    }
  }

  async removeItem(userId: string, itemId: string): Promise<any> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }
      if (!itemId) {
        throw new BadRequestException('Item ID is required');
      }

      const cart = await this.getCart(userId);

      const existingItem = await this.prisma.cartItem.findFirst({
        where: {
          id: itemId,
          cartId: cart.id,
        },
      });

      if (!existingItem) {
        throw new NotFoundException('Cart item not found');
      }

      return this.prisma.cartItem.delete({
        where: {
          id: itemId,
          cartId: cart.id,
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
        'Failed to remove cart item: ' + error.message,
      );
    }
  }

  async clearCart(userId: string): Promise<{ message: string }> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      const cart = await this.getCart(userId);

      await this.prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return { message: 'Cart cleared successfully' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to clear cart: ' + error.message,
      );
    }
  }

  async getCartTotal(userId: string): Promise<{
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    itemCount: number;
  }> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      const cart = await this.getCart(userId);

      const items = await this.prisma.cartItem.findMany({
        where: { cartId: cart.id },
      });

      const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const tax = subtotal * 0.1; // 10% tax
      const shipping = subtotal > 50 ? 0 : 10; // Free shipping over $50
      const total = subtotal + tax + shipping;

      return {
        subtotal,
        tax,
        shipping,
        total,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to calculate cart total: ' + error.message,
      );
    }
  }
}
