import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma.service';

@Injectable()
export class WalletService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  /**
   * Finds a user's wallet, creating one if it doesn't exist.
   * This is a private method to ensure a wallet exists before any operation.
   */
  private async findOrCreateWallet(
    userId: string,
    tx?: Prisma.TransactionClient,
  ) {
    const prismaClient = tx || this.prisma;
    let wallet = await prismaClient.wallet.findUnique({ where: { userId } });

    if (!wallet) {
      wallet = await prismaClient.wallet.create({
        data: { userId },
      });
    }
    return wallet;
  }

  /**
   * Credits a user's wallet with a given amount.
   * Creates a transaction record for the credit.
   */
  async credit(
    userId: string,
    amount: number,
    description: string,
    relatedId?: string,
  ) {
    if (amount <= 0) {
      throw new InternalServerErrorException('Credit amount must be positive.');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const wallet = await this.findOrCreateWallet(userId, tx);

        const updatedWallet = await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: {
              increment: amount,
            },
          },
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
              },
            },
          },
        });

        const transaction = await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            amount,
            type: TransactionType.CREDIT,
            description,
            relatedId,
          },
        });

        // Send wallet credit email
        if (updatedWallet.user?.email) {
          this.mailService
            .sendWalletCreditEmail(updatedWallet.user.email, {
              firstName: updatedWallet.user.firstName || 'there',
              amount: amount,
              reason: description,
              newBalance: updatedWallet.balance,
              transactionId: transaction.id,
            })
            .catch((err) =>
              console.error('Failed to send wallet credit email:', err),
            );
        }

        return updatedWallet;
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to credit wallet: ' + error.message,
      );
    }
  }

  /**
   * Retrieves a user's wallet details and transaction history.
   */
  async getUserWalletDetails(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!wallet) {
      // If they don't have a wallet, create one and return it empty.
      return this.findOrCreateWallet(userId);
    }

    return wallet;
  }
}
