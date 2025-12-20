import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { PrismaService } from '../prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { RefundsController } from './refunds.controller';
import { RefundsService } from './refunds.service';

@Module({
  imports: [MailModule],
  controllers: [RefundsController],
  providers: [RefundsService, PrismaService, WalletService],
})
export class RefundsModule {}
