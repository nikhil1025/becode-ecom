import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ReturnStatus, ReturnType } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReturnsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    orderId: string,
    type: ReturnType,
    reason: string,
    items: Array<{
      orderItemId: string;
      quantity: number;
      exchangeProductId?: string;
    }>,
    comments?: string,
  ) {
    try {
      // Verify order belongs to user
      const order = await this.prisma.order.findFirst({
        where: { id: orderId, userId },
        include: { items: true },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // Create return with items
      return await this.prisma.return.create({
        data: {
          userId,
          orderId,
          type,
          reason,
          comments,
          items: {
            create: items.map((item) => ({
              orderItemId: item.orderItemId,
              quantity: item.quantity,
              exchangeProduct: item.exchangeProductId,
            })),
          },
        },
        include: {
          items: true,
          order: true,
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
        'Failed to create return: ' + error.message,
      );
    }
  }

  async findByUser(userId: string) {
    try {
      return await this.prisma.return.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              orderItem: {
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
                  variant: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
              exchangeProductRef: {
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
          order: {
            select: {
              id: true,
              orderNumber: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve returns: ' + error.message,
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.return.findMany({
        include: {
          items: {
            include: {
              orderItem: {
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
                  variant: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
              exchangeProductRef: {
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
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
              createdAt: true,
              total: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve returns: ' + error.message,
      );
    }
  }

  async updateStatus(returnId: string, status: ReturnStatus) {
    try {
      return await this.prisma.return.update({
        where: { id: returnId },
        data: { status },
        include: {
          items: true,
          order: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update return status: ' + error.message,
      );
    }
  }
}
