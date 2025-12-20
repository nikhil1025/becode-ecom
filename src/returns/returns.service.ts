import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, ReturnStatus } from '@prisma/client';
import { FileUploadService } from '../common/services/file-upload.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { CreateReturnDto, ReturnItemDto } from './dto';

type CreateReturnRequest = Omit<CreateReturnDto, 'items'> & {
  items: ReturnItemDto[];
};

@Injectable()
export class ReturnsService {
  constructor(
    private prisma: PrismaService,
    private fileUploadService: FileUploadService,
    private walletService: WalletService,
    private mailService: MailService,
  ) {}

  async requestReturn(
    userId: string,
    createReturnRequest: CreateReturnRequest,
    files: Express.Multer.File[],
  ) {
    const { orderId, reason, items, type } = createReturnRequest;

    const newReturn = await this.prisma.$transaction(async (tx) => {
      // 1. Validate the order
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
      if (order.status !== OrderStatus.DELIVERED) {
        throw new BadRequestException(
          'Returns can only be requested for delivered orders.',
        );
      }

      // CRITICAL FIX: Check return time limit (30 days from delivery)
      // This prevents users from returning items months/years after delivery
      const deliveryDate = order.updatedAt; // Assuming updatedAt is set when order is delivered
      const daysSinceDelivery = Math.floor(
        (Date.now() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      const RETURN_WINDOW_DAYS = 30;

      if (daysSinceDelivery > RETURN_WINDOW_DAYS) {
        throw new BadRequestException(
          `Returns can only be requested within ${RETURN_WINDOW_DAYS} days of delivery. This order was delivered ${daysSinceDelivery} days ago.`,
        );
      }

      // 2. Validate each item and check for duplicates
      for (const item of items) {
        const orderItem = await tx.orderItem.findUnique({
          where: { id: item.orderItemId },
        });

        if (!orderItem || orderItem.orderId !== orderId) {
          throw new BadRequestException(
            `Order item ${item.orderItemId} is not valid for this order.`,
          );
        }

        // CRITICAL: Prevent returning cancelled items
        if (orderItem.status === 'CANCELLED') {
          throw new BadRequestException(
            `Cannot return cancelled item ${item.orderItemId}. Item was already cancelled.`,
          );
        }

        // CRITICAL: Prevent returning already returned items
        if (orderItem.status === 'RETURNED') {
          throw new BadRequestException(
            `Cannot return item ${item.orderItemId}. Item was already returned.`,
          );
        }

        if (item.quantity > orderItem.quantity) {
          throw new BadRequestException(
            `Cannot return more items than were purchased for ${orderItem.id}.`,
          );
        }

        // CRITICAL FIX: Check cumulative returned quantity to prevent over-returning
        const existingReturnItems = await tx.returnItem.findMany({
          where: {
            orderItemId: item.orderItemId,
            return: {
              status: {
                notIn: [ReturnStatus.REJECTED, ReturnStatus.CANCELLED],
              },
            },
          },
        });

        const totalReturnedQuantity = existingReturnItems.reduce(
          (sum, ri) => sum + ri.quantity,
          0,
        );

        if (totalReturnedQuantity + item.quantity > orderItem.quantity) {
          throw new ConflictException(
            `Cannot return ${item.quantity} units of item ${item.orderItemId}. Already returned ${totalReturnedQuantity} out of ${orderItem.quantity} purchased. You can only return ${orderItem.quantity - totalReturnedQuantity} more.`,
          );
        }

        // Check if user is trying to return the exact same quantity again (suspicious)
        const duplicateReturn = existingReturnItems.find(
          (ri) => ri.quantity === item.quantity,
        );
        if (duplicateReturn) {
          throw new ConflictException(
            `A return request for ${item.quantity} units of item ${item.orderItemId} already exists. Please check your existing returns.`,
          );
        }
      }

      // 3. Create the return request (without images first)
      const createdReturn = await tx.return.create({
        data: {
          orderId,
          userId,
          reason,
          type,
          status: ReturnStatus.REQUESTED,
          statusHistory: [
            {
              status: 'REQUESTED',
              timestamp: new Date().toISOString(),
              note: 'Return request submitted',
            },
          ],
          items: {
            create: items.map((item) => ({
              orderItemId: item.orderItemId,
              quantity: item.quantity,
            })),
          },
        },
      });

      // 4. Handle image uploads using the pipeline
      let imageUrls: string[] = [];
      if (files && files.length > 0) {
        const uploadedImages =
          await this.fileUploadService.uploadMultipleImages(
            files,
            `returns/${createdReturn.id}`,
          );
        imageUrls = uploadedImages.map((img) => img.url);
      }

      // 5. Update the return with image URLs
      if (imageUrls.length > 0) {
        return tx.return.update({
          where: { id: createdReturn.id },
          data: { images: imageUrls },
          include: {
            items: true,
            order: true,
          },
        });
      }

      return tx.return.findUnique({
        where: { id: createdReturn.id },
        include: {
          items: true,
          order: true,
        },
      });
    });

    return newReturn;
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

  async findAll(
    page: number = 1,
    limit: number = 20,
    status?: ReturnStatus,
    userId?: string,
  ) {
    try {
      // CRITICAL FIX: Add pagination to prevent performance issues
      const skip = (page - 1) * limit;

      const where: any = {};
      if (status) {
        where.status = status;
      }
      if (userId) {
        where.userId = userId;
      }

      const [returns, total] = await Promise.all([
        this.prisma.return.findMany({
          where,
          skip,
          take: limit,
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
        }),
        this.prisma.return.count({ where }),
      ]);

      return {
        returns,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve returns: ' + error.message,
      );
    }
  }

  async findOneForAdmin(returnId: string) {
    const returnRequest = await this.prisma.return.findUnique({
      where: { id: returnId },
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
                variant: true,
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
        order: true,
      },
    });

    if (!returnRequest) {
      throw new NotFoundException('Return request not found.');
    }

    return returnRequest;
  }

  async updateStatus(
    returnId: string,
    status: ReturnStatus,
    rejectionReason?: string,
    adminNote?: string,
  ) {
    if (status === ReturnStatus.REFUNDED) {
      throw new BadRequestException(
        'Refunds must be processed through the refund endpoint, not by updating status directly.',
      );
    }

    if (status === ReturnStatus.REJECTED && !rejectionReason) {
      throw new BadRequestException(
        'Rejection reason is required when rejecting a return',
      );
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Get current return to append to history
        const currentReturn = await tx.return.findUnique({
          where: { id: returnId },
          include: {
            items: {
              include: {
                orderItem: true,
              },
            },
          },
        });

        if (!currentReturn) {
          throw new NotFoundException('Return request not found.');
        }

        // CRITICAL FIX: Validate state transitions
        const validTransitions: Record<ReturnStatus, ReturnStatus[]> = {
          [ReturnStatus.REQUESTED]: [
            ReturnStatus.UNDER_REVIEW,
            ReturnStatus.REJECTED,
            ReturnStatus.CANCELLED,
          ],
          [ReturnStatus.UNDER_REVIEW]: [
            ReturnStatus.HOLD_FOR_INSPECTION,
            ReturnStatus.ACCEPTED,
            ReturnStatus.REJECTED,
          ],
          [ReturnStatus.HOLD_FOR_INSPECTION]: [
            ReturnStatus.ACCEPTED,
            ReturnStatus.REJECTED,
          ],
          [ReturnStatus.ACCEPTED]: [
            ReturnStatus.EXCHANGE_APPROVED,
            ReturnStatus.APPROVED, // Alias for ACCEPTED
          ],
          [ReturnStatus.APPROVED]: [ReturnStatus.EXCHANGE_APPROVED],
          [ReturnStatus.EXCHANGE_APPROVED]: [],
          [ReturnStatus.REJECTED]: [],
          [ReturnStatus.CANCELLED]: [],
          [ReturnStatus.REFUNDED]: [],
          [ReturnStatus.PENDING]: [
            ReturnStatus.UNDER_REVIEW,
            ReturnStatus.REJECTED,
          ],
          [ReturnStatus.PROCESSING]: [
            ReturnStatus.COMPLETED,
            ReturnStatus.CANCELLED,
          ],
          [ReturnStatus.COMPLETED]: [],
        };

        const allowedNextStates = validTransitions[currentReturn.status] || [];
        if (
          !allowedNextStates.includes(status) &&
          currentReturn.status !== status
        ) {
          throw new BadRequestException(
            `Invalid status transition from ${currentReturn.status} to ${status}. Allowed transitions: ${allowedNextStates.join(', ') || 'none'}`,
          );
        }

        // CRITICAL FIX: Restore stock when return is ACCEPTED
        // Stock restoration happens here, NOT during refund execution
        if (
          status === ReturnStatus.ACCEPTED ||
          status === ReturnStatus.APPROVED
        ) {
          for (const item of currentReturn.items) {
            // Update OrderItem status to RETURNED
            await tx.orderItem.update({
              where: { id: item.orderItemId },
              data: { status: 'RETURNED' as any },
            });

            // Restore stock
            if (item.orderItem.variantId) {
              await tx.productVariant.update({
                where: { id: item.orderItem.variantId },
                data: { stockQuantity: { increment: item.quantity } },
              });
            } else {
              await tx.product.update({
                where: { id: item.orderItem.productId },
                data: { stockQuantity: { increment: item.quantity } },
              });
            }
          }
        }

        const statusHistory = (currentReturn.statusHistory as any[]) || [];
        statusHistory.push({
          status,
          timestamp: new Date().toISOString(),
          note: adminNote || `Status changed to ${status}`,
        });

        const updatedReturn = await tx.return.update({
          where: { id: returnId },
          data: {
            status,
            rejectionReason:
              status === ReturnStatus.REJECTED ? rejectionReason : undefined,
            statusHistory,
          },
          include: {
            items: true,
            order: true,
            user: true,
          },
        });

        // Send email notification to user
        try {
          await this.mailService.sendReturnStatusUpdate(
            updatedReturn.user.email,
            {
              returnId: updatedReturn.id,
              orderNumber: updatedReturn.order.orderNumber,
              status,
              rejectionReason,
              adminNote,
            },
          );
        } catch (emailError) {
          // Log email error but don't fail the transaction
          console.error('Failed to send return status email:', emailError);
        }

        return updatedReturn;
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update return status: ' + error.message,
      );
    }
  }
}
