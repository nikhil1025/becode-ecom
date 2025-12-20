import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { MailModule } from '../mail/mail.module';
import { PrismaService } from '../prisma.service';
import { StorageModule } from '../storage/storage.module';
import { WalletModule } from '../wallet/wallet.module';
import { ReturnsController, UserReturnsController } from './returns.controller';
import { ReturnsService } from './returns.service';

@Module({
  imports: [CommonModule, StorageModule, WalletModule, MailModule],
  controllers: [ReturnsController, UserReturnsController],
  providers: [ReturnsService, PrismaService],
})
export class ReturnsModule {}
