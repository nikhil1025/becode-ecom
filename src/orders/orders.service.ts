import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { OrderItemStatus, OrderStatus, PaymentStatus } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { CancelItemsDto } from './dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private walletService: WalletService,
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

      return await this.prisma.$transaction(async (tx) => {
        // 1. Validate stock and prepare updates
        const stockUpdates: Promise<any>[] = [];
        for (const item of items) {
          if (item.variantId) {
            const variant = await tx.productVariant.findUnique({
              where: { id: item.variantId },
            });
            if (!variant || variant.stockQuantity < item.quantity) {
              throw new BadRequestException(
                `Not enough stock for variant ${variant?.name || item.variantId}`,
              );
            }
            stockUpdates.push(
              tx.productVariant.update({
                where: { id: item.variantId },
                data: { stockQuantity: { decrement: item.quantity } },
              }),
            );
          } else {
            const product = await tx.product.findUnique({
              where: { id: item.productId },
            });
            if (!product || product.stockQuantity < item.quantity) {
              throw new BadRequestException(
                `Not enough stock for product ${product?.name || item.productId}`,
              );
            }
            stockUpdates.push(
              tx.product.update({
                where: { id: item.productId },
                data: { stockQuantity: { decrement: item.quantity } },
              }),
            );
          }
        }

        // 2. Execute stock updates
        await Promise.all(stockUpdates);

        // 3. Create the order
        const subtotal = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
        const tax = subtotal * 0.1;
        const shipping = subtotal > 50 ? 0 : 10;
        const total = subtotal + tax + shipping;

        const order = await tx.order.create({
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
                status: OrderItemStatus.PLACED,
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

        // 4. Clear cart after order
        const cart = await tx.cart.findUnique({ where: { userId } });
        if (cart) {
          await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        }

        // 5. Send order confirmation email (outside transaction)
        const user = await tx.user.findUnique({ where: { id: userId } });
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
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create order: ' + error.message,
      );
    }
  }

  async cancelOrderItems(
    userId: string,
    orderId: string,
    cancelItemsDto: CancelItemsDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch and validate the order
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        throw new NotFoundException('Order not found.');
      }
      if (order.userId !== userId) {
        throw new NotFoundException(
          'Order does not belong to the current user.',
        );
      }

      // Check tracking status - cancellation only allowed before shipped
      const allowedTrackingStatuses = ['ORDER_PLACED', 'CONFIRMED', 'PACKED'];
      if (!allowedTrackingStatuses.includes(order.trackingStatus)) {
        throw new BadRequestException(
          `Order cannot be cancelled as it is already ${order.trackingStatus}. Cancellation is only allowed before shipment.`,
        );
      }

      const cancellableStatuses: OrderStatus[] = [
        OrderStatus.PENDING,
        OrderStatus.PROCESSING,
        OrderStatus.CONFIRMED,
      ];
      if (!cancellableStatuses.includes(order.status)) {
        throw new BadRequestException(
          `Order cannot be cancelled in its current status: ${order.status}`,
        );
      }

      let totalRefundAmount = 0;
      const itemsToCancel = cancelItemsDto.items;

      // 2. Validate all items before making changes
      for (const item of itemsToCancel) {
        const orderItem = order.items.find((oi) => oi.id === item.orderItemId);

        if (!orderItem) {
          throw new BadRequestException(
            `Order item ${item.orderItemId} not found in this order.`,
          );
        }
        if (orderItem.status === OrderItemStatus.CANCELLED) {
          throw new BadRequestException(
            `Order item ${item.orderItemId} is already cancelled.`,
          );
        }
        if (orderItem.status === OrderItemStatus.RETURNED) {
          throw new BadRequestException(
            `Order item ${item.orderItemId} is already returned and cannot be cancelled.`,
          );
        }
      }

      // 3. Process cancellations
      for (const item of itemsToCancel) {
        const orderItem = order.items.find((oi) => oi.id === item.orderItemId);

        if (orderItem && orderItem.status === OrderItemStatus.PLACED) {
          // Update item status
          await tx.orderItem.update({
            where: { id: orderItem.id },
            data: {
              status: OrderItemStatus.CANCELLED,
              cancellationReason: item.reason,
              cancelledAt: new Date(),
            },
          });

          // Restore stock
          if (orderItem.variantId) {
            await tx.productVariant.update({
              where: { id: orderItem.variantId },
              data: { stockQuantity: { increment: orderItem.quantity } },
            });
          } else {
            await tx.product.update({
              where: { id: orderItem.productId },
              data: { stockQuantity: { increment: orderItem.quantity } },
            });
          }

          // Add to total refund amount
          totalRefundAmount += orderItem.price * orderItem.quantity;
        }
      }

      // 4. Trigger refund to user's wallet
      if (totalRefundAmount > 0) {
        await this.walletService.credit(
          userId,
          totalRefundAmount,
          `Refund for cancelled items in order ${order.orderNumber}`,
          order.id,
        );
      }

      // 4.5. Send cancellation email notification
      try {
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (user) {
          const cancelledItems: Array<{
            name: string;
            quantity: number;
            refundAmount: number;
          }> = [];
          for (const item of itemsToCancel) {
            const orderItem = order.items.find(
              (oi) => oi.id === item.orderItemId,
            );
            if (orderItem) {
              const productSnapshot = orderItem.productSnapshot as any;
              cancelledItems.push({
                name: productSnapshot?.name || 'Unknown Product',
                quantity: orderItem.quantity,
                refundAmount: orderItem.price * orderItem.quantity,
              });
            }
          }

          await this.mailService.sendOrderCancellation(user.email, {
            orderNumber: order.orderNumber,
            cancelledItems,
            totalRefund: totalRefundAmount,
          });
        }
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError);
      }

      // 5. Check if all items are cancelled and update order status
      const updatedOrderItems = await tx.orderItem.findMany({
        where: { orderId: order.id },
      });

      const allItemsCancelled = updatedOrderItems.every(
        (item) => item.status === OrderItemStatus.CANCELLED,
      );

      if (allItemsCancelled) {
        return tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.CANCELLED },
          include: { items: true },
        });
      }

      return tx.order.findUnique({
        where: { id: order.id },
        include: { items: true },
      });
    });
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

  async getCancelledOrders(
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
          where: {
            OR: [
              { status: OrderStatus.CANCELLED },
              {
                items: {
                  some: {
                    status: OrderItemStatus.CANCELLED,
                  },
                },
              },
            ],
          },
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
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: {
                      where: { isFeatured: true },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            updatedAt: 'desc',
          },
        }),
        this.prisma.order.count({
          where: {
            OR: [
              { status: OrderStatus.CANCELLED },
              {
                items: {
                  some: {
                    status: OrderItemStatus.CANCELLED,
                  },
                },
              },
            ],
          },
        }),
      ]);

      // Transform orders to include cancelled items details
      const transformedOrders = orders.map((order) => ({
        ...order,
        cancelledItems: order.items.filter(
          (item) => item.status === OrderItemStatus.CANCELLED,
        ),
        hasCancelledItems: order.items.some(
          (item) => item.status === OrderItemStatus.CANCELLED,
        ),
      }));

      return {
        orders: transformedOrders,
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
        'Failed to retrieve cancelled orders: ' + error.message,
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
}
