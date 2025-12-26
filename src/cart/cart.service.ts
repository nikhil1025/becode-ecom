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
              product: true,
              variant: {
                include: {
                  images: { where: { isPrimary: true }, take: 1 },
                },
              },
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
                product: true,
                variant: {
                  include: {
                    images: { where: { isPrimary: true }, take: 1 },
                  },
                },
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
    variantId: string, // MANDATORY - no longer optional
  ): Promise<any> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }
      if (!productId) {
        throw new BadRequestException('Product ID is required');
      }
      if (!variantId) {
        throw new BadRequestException(
          'Variant ID is required - please select a variant',
        );
      }
      if (!quantity || quantity < 1) {
        throw new BadRequestException('Quantity must be at least 1');
      }

      const cart = await this.getCart(userId);

      // Check product exists and is available
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (product.status !== 'PUBLISHED') {
        throw new BadRequestException('Product is not available');
      }

      // ALWAYS check variant (mandatory)
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: variantId },
        include: { images: { where: { isPrimary: true }, take: 1 } },
      });

      if (!variant) {
        throw new NotFoundException('Product variant not found');
      }

      if (variant.productId !== productId) {
        throw new BadRequestException(
          'Variant does not belong to this product',
        );
      }

      if (!variant.isActive) {
        throw new BadRequestException('This variant is no longer available');
      }

      // Use variant price and stock
      const price = variant.salePrice || variant.price;
      const availableStock = variant.stockQuantity;

      if (availableStock < quantity) {
        throw new BadRequestException(
          `Insufficient stock. Only ${availableStock} available`,
        );
      }

      // Check if item already exists in cart (same variant)
      const existingItem = await this.prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          variantId,
        },
      });

      if (existingItem) {
        // Update existing item
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity > availableStock) {
          throw new BadRequestException(
            `Cannot add ${quantity} more. Maximum ${availableStock - existingItem.quantity} can be added`,
          );
        }

        return this.prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: newQuantity,
            price, // Update price in case it changed
          },
          include: {
            product: true,
            variant: {
              include: {
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        });
      }

      // Create new cart item
      return this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId,
          quantity,
          price,
        },
        include: {
          product: true,
          variant: {
            include: {
              images: { where: { isPrimary: true }, take: 1 },
            },
          },
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
        include: {
          product: true,
          variant: true,
        },
      });

      if (!existingItem) {
        throw new NotFoundException('Cart item not found');
      }

      // Check stock availability - VARIANT ONLY
      if (!existingItem.variant || !existingItem.variantId) {
        throw new BadRequestException(
          'Invalid cart item - variant information missing',
        );
      }

      const availableStock = existingItem.variant.stockQuantity;

      if (!existingItem.variant.isActive) {
        throw new BadRequestException('This variant is no longer available');
      }

      if (quantity > availableStock) {
        throw new BadRequestException(
          `Requested quantity exceeds available stock. Only ${availableStock} available`,
        );
      }

      return this.prisma.cartItem.update({
        where: {
          id: itemId,
          cartId: cart.id,
        },
        data: { quantity },
        include: {
          product: true,
          variant: {
            include: {
              images: { where: { isPrimary: true }, take: 1 },
            },
          },
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

  /**
   * Validate all cart items before checkout
   * Check for variant availability, stock, and price changes
   */
  async validateCartForCheckout(userId: string): Promise<{
    valid: boolean;
    issues: Array<{
      itemId: string;
      productName: string;
      variantName?: string;
      issue: string;
    }>;
  }> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      const cart = await this.prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        return {
          valid: false,
          issues: [{ itemId: '', productName: '', issue: 'Cart is empty' }],
        };
      }

      const issues: Array<{
        itemId: string;
        productName: string;
        variantName?: string;
        issue: string;
      }> = [];

      for (const item of cart.items) {
        // Validate variant exists (MANDATORY)
        if (!item.variantId || !item.variant) {
          issues.push({
            itemId: item.id,
            productName: item.product.name,
            issue: 'Invalid cart item - variant information missing',
          });
          continue;
        }

        // Check product status
        if (item.product.status !== 'PUBLISHED') {
          issues.push({
            itemId: item.id,
            productName: item.product.name,
            variantName: item.variant.name,
            issue: 'Product is no longer available',
          });
          continue;
        }

        // Check variant availability
        if (!item.variant.isActive) {
          issues.push({
            itemId: item.id,
            productName: item.product.name,
            variantName: item.variant.name,
            issue: 'Variant is no longer available',
          });
          continue;
        }

        // Check variant stock
        if (item.variant.stockQuantity < item.quantity) {
          issues.push({
            itemId: item.id,
            productName: item.product.name,
            variantName: item.variant.name,
            issue: `Insufficient stock. Only ${item.variant.stockQuantity} available`,
          });
        }
      }

      return {
        valid: issues.length === 0,
        issues,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to validate cart: ' + error.message,
      );
    }
  }
}
