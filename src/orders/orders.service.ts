import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async createOrder(
    userId: string,
    data: {
      items: Array<{
        productId: string;
        quantity: number;
        price: number;
        variantId?: string;
      }>;
      shippingAddress: any;
      billingAddress?: any;
    },
  ) {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }
      if (!data || !data.items || data.items.length === 0) {
        throw new BadRequestException('Order items are required');
      }
      if (!data.shippingAddress) {
        throw new BadRequestException('Shipping address is required');
      }

      // Validate each item
      for (const item of data.items) {
        if (!item.productId) {
          throw new BadRequestException('Product ID is required for all items');
        }
        if (!item.quantity || item.quantity < 1) {
          throw new BadRequestException(
            'Valid quantity is required for all items',
          );
        }
        if (!item.price || item.price < 0) {
          throw new BadRequestException(
            'Valid price is required for all items',
          );
        }
      }

      const { items, shippingAddress, billingAddress } = data;

      const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const tax = subtotal * 0.1;
      const shipping = subtotal > 50 ? 0 : 10;
      const total = subtotal + tax + shipping;

      const order = await this.prisma.order.create({
        data: {
          userId,
          orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          subtotal,
          tax,
          shipping,
          total,
          shippingAddress: shippingAddress || {},
          billingAddress: billingAddress || shippingAddress || {},
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
              productSnapshot: {
                name: '', // Will be filled from product
                price: item.price,
              },
            })),
          },
        },
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

      // Clear cart after order
      const cart = await this.prisma.cart.findUnique({ where: { userId } });
      if (cart) {
        await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      }

      // Send order confirmation email
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user?.email) {
        try {
          await this.mailService.sendOrderConfirmation(user.email, {
            orderId: order.orderNumber,
            totalAmount: total,
            items: items.map((item) => ({
              name: item.productId, // TODO: Get actual product name
              quantity: item.quantity,
              price: item.price,
            })),
          });
        } catch (error) {
          console.error('Failed to send order confirmation email:', error);
        }
      }

      return order;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create order: ' + error.message,
      );
    }
  }

  async getUserOrders(userId: string): Promise<any[]> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      return await this.prisma.order.findMany({
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
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve user orders: ' + error.message,
      );
    }
  }

  async getOrderById(userId: string, orderId: string): Promise<any> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }
      if (!orderId) {
        throw new BadRequestException('Order ID is required');
      }

      const order = await this.prisma.order.findFirst({
        where: {
          id: orderId,
          userId,
        },
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

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      return order;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve order: ' + error.message,
      );
    }
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<any> {
    try {
      if (!orderId) {
        throw new BadRequestException('Order ID is required');
      }
      if (!status) {
        throw new BadRequestException('Order status is required');
      }

      const existingOrder = await this.prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!existingOrder) {
        throw new NotFoundException('Order not found');
      }

      const order = await this.prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
            },
          },
          user: true,
        },
      });

      // Send email notification based on status
      if (order.user?.email) {
        try {
          if (status === OrderStatus.SHIPPED) {
            await this.mailService.sendOrderShipped(order.user.email, {
              orderId: order.orderNumber,
            });
          } else if (status === OrderStatus.DELIVERED) {
            await this.mailService.sendOrderDelivered(order.user.email, {
              orderId: order.orderNumber,
            });
          }
        } catch (error) {
          console.error('Failed to send order status email:', error);
        }
      }

      return order;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update order status: ' + error.message,
      );
    }
  }

  async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
  ): Promise<any> {
    try {
      if (!orderId) {
        throw new BadRequestException('Order ID is required');
      }
      if (!paymentStatus) {
        throw new BadRequestException('Payment status is required');
      }

      const existingOrder = await this.prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!existingOrder) {
        throw new NotFoundException('Order not found');
      }

      return await this.prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus },
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update payment status: ' + error.message,
      );
    }
  }

  async cancelOrder(userId: string, orderId: string): Promise<any> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }
      if (!orderId) {
        throw new BadRequestException('Order ID is required');
      }

      const order = await this.prisma.order.findFirst({
        where: {
          id: orderId,
          userId,
        },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (
        order.status !== OrderStatus.PENDING &&
        order.status !== OrderStatus.PROCESSING
      ) {
        throw new BadRequestException('Cannot cancel order in current status');
      }

      return this.prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to cancel order: ' + error.message,
      );
    }
  }

  // Admin methods
  async getAllOrders(
    page = 1,
    limit = 20,
  ): Promise<{ orders: any[]; pagination: any }> {
    try {
      if (page < 1) {
        throw new BadRequestException('Page must be at least 1');
      }
      if (limit < 1 || limit > 100) {
        throw new BadRequestException('Limit must be between 1 and 100');
      }

      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        this.prisma.order.findMany({
          skip,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            items: {
              include: {
                product: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.order.count(),
      ]);

      return {
        orders,
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
        'Failed to retrieve orders: ' + error.message,
      );
    }
  }

  async getAdminOrderById(orderId: string): Promise<any> {
    try {
      if (!orderId) {
        throw new BadRequestException('Order ID is required');
      }

      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              avatar: true,
            },
          },
          deliveryAgent: true,
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

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // Get return info if exists
      const returns = await this.prisma.return.findMany({
        where: { orderId: order.id },
        include: {
          items: {
            include: {
              orderItem: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });

      // Tracking info is already included in the order (trackingStatus, deliveryAgent)
      return {
        ...order,
        returns,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve order: ' + error.message,
      );
    }
  }

  async getOrderTracking(userId: string, orderId: string): Promise<any> {
    try {
      if (!userId || !orderId) {
        throw new BadRequestException('User ID and Order ID are required');
      }

      const order = await this.prisma.order.findFirst({
        where: { id: orderId, userId },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // Generate tracking timeline based on order status
      const timeline: Array<{
        status: string;
        label: string;
        timestamp: Date;
        completed: boolean;
      }> = [];
      timeline.push({
        status: 'PENDING',
        label: 'Order Placed',
        timestamp: order.createdAt,
        completed: true,
      });

      if (
        order.status === OrderStatus.PROCESSING ||
        order.status === OrderStatus.SHIPPED ||
        order.status === OrderStatus.DELIVERED
      ) {
        timeline.push({
          status: 'PROCESSING',
          label: 'Processing',
          timestamp: order.updatedAt,
          completed: true,
        });
      }

      if (
        order.status === OrderStatus.SHIPPED ||
        order.status === OrderStatus.DELIVERED
      ) {
        timeline.push({
          status: 'SHIPPED',
          label: 'Shipped',
          timestamp: order.updatedAt,
          completed: true,
        });
      }

      if (order.status === OrderStatus.DELIVERED) {
        timeline.push({
          status: 'DELIVERED',
          label: 'Delivered',
          timestamp: order.updatedAt,
          completed: true,
        });
      }

      if (order.status === OrderStatus.CANCELLED) {
        timeline.push({
          status: 'CANCELLED',
          label: 'Cancelled',
          timestamp: order.updatedAt,
          completed: true,
        });
      }

      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        currentStatus: order.status,
        timeline,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to get order tracking: ' + error.message,
      );
    }
  }

  async requestReturn(
    userId: string,
    orderId: string,
    reason: string,
    items?: string[],
  ): Promise<any> {
    try {
      if (!userId || !orderId || !reason) {
        throw new BadRequestException(
          'User ID, Order ID, and reason are required',
        );
      }

      const order = await this.prisma.order.findFirst({
        where: { id: orderId, userId },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.status !== OrderStatus.DELIVERED) {
        throw new BadRequestException(
          'Can only request return for delivered orders',
        );
      }

      // Create return request (simplified - would need a Return model in production)
      const returnRequest = {
        id: `RET-${Date.now()}`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId,
        reason,
        items: items || [],
        status: 'PENDING',
        createdAt: new Date(),
      };

      // In production, save to database
      return returnRequest;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to request return: ' + error.message,
      );
    }
  }

  async getAllReturns(
    page = 1,
    limit = 20,
  ): Promise<{ returns: any[]; pagination: any }> {
    try {
      // Simplified - would query Return model in production
      await Promise.resolve();
      return {
        returns: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve returns: ' + error.message,
      );
    }
  }

  async updateReturnStatus(returnId: string, status: string): Promise<any> {
    try {
      if (!returnId || !status) {
        throw new BadRequestException('Return ID and status are required');
      }
      await Promise.resolve();

      // Simplified - would update Return model in production
      return {
        id: returnId,
        status,
        updatedAt: new Date(),
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update return status: ' + error.message,
      );
    }
  }
}
