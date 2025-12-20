import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ReturnStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { MailService } from '../mail/mail.service';
import { ExecuteRefundDto } from './dto/execute-refund.dto';

@Injectable()
export class RefundsService {
  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
    private mailService: MailService,
  ) {}

  async findPendingRefunds() {
    try {
      return await this.prisma.return.findMany({
        where: {
          status: {
            in: [ReturnStatus.ACCEPTED, ReturnStatus.APPROVED],
          },
          // CRITICAL FIX: Filter out returns that already have refunds
          refund: null,
        },
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
          user: true,
          order: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve pending refunds: ' + error.message,
      );
    }
  }

  async executeRefund(executeRefundDto: ExecuteRefundDto) {
    const {
      returnId,
      transactionId,
      notes,
      amount,
      method,
      adminRemarks,
      orderItemId,
    } = executeRefundDto;

    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch and validate the return request
      const returnRequest = await tx.return.findUnique({
        where: { id: returnId },
        include: {
          items: {
            include: {
              orderItem: true,
            },
          },
          user: true,
          order: true,
          refund: true,
        },
      });

      if (!returnRequest) {
        throw new NotFoundException('Return request not found.');
      }

      // Prevent double refunds
      if (returnRequest.refund) {
        throw new BadRequestException(
          'Refund has already been processed for this return.',
        );
      }

      if (
        returnRequest.status !== ReturnStatus.ACCEPTED &&
        returnRequest.status !== ReturnStatus.APPROVED
      ) {
        throw new BadRequestException(
          'Refunds can only be processed for returns with "ACCEPTED" or "APPROVED" status.',
        );
      }

      // 2. NOTE: Stock restoration removed from here to prevent double restoration
      // Stock should ONLY be restored when return is ACCEPTED by admin,
      // NOT during refund execution (which happens AFTER acceptance)

      // 3. Get orderItemId (first item if not specified)
      const refundOrderItemId =
        orderItemId || returnRequest.items[0]?.orderItemId;
      if (!refundOrderItemId) {
        throw new BadRequestException('No order item found for this return.');
      }

      // Validate refund amount is positive
      if (amount <= 0) {
        throw new BadRequestException('Refund amount must be greater than 0.');
      }

      // 4. Create refund record
      const refund = await tx.refund.create({
        data: {
          returnId,
          orderId: returnRequest.orderId,
          orderItemId: refundOrderItemId,
          amount,
          method: method || 'WALLET',
          transactionId,
          adminRemarks,
          notes,
          userId: returnRequest.userId,
          processedBy: executeRefundDto.adminUserId || 'ADMIN',
          refundDate: new Date(),
        },
      });

      // 5. Credit the user's wallet (only if method is WALLET or ORIGINAL and payment was through wallet)
      if (amount > 0 && (method === 'WALLET' || !method)) {
        await this.walletService.credit(
          returnRequest.userId,
          amount,
          `Refund for return #${returnRequest.id} - Order ${returnRequest.order.orderNumber}`,
          refund.id,
        );
      }

      // 6. Update the return status to REFUNDED
      const updatedReturn = await tx.return.update({
        where: { id: returnId },
        data: { status: ReturnStatus.REFUNDED },
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
          refund: true,
          user: true,
          order: true,
        },
      });

      // 7. Send refund confirmation email
      try {
        await this.mailService.sendRefundConfirmation(
          updatedReturn.user.email,
          {
            returnId: updatedReturn.id,
            orderNumber: updatedReturn.order.orderNumber,
            amount,
            method: method || 'WALLET',
            transactionId,
          },
        );
      } catch (emailError) {
        console.error('Failed to send refund confirmation email:', emailError);
      }

      return updatedReturn;
    });
  }

  async getAllRefunds(page: number = 1, limit: number = 20) {
    try {
      // CRITICAL FIX: Add pagination to prevent performance issues
      const skip = (page - 1) * limit;

      const [refunds, total] = await Promise.all([
        this.prisma.refund.findMany({
          skip,
          take: limit,
          include: {
            return: {
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
                order: true,
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
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.refund.count(),
      ]);

      return {
        refunds,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve refunds: ' + error.message,
      );
    }
  }
}
