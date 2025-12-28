import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { PrismaService } from '../prisma.service';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';

@Module({
  imports: [MailModule],
  controllers: [DeliveryController],
  providers: [DeliveryService, PrismaService],
})
export class DeliveryModule {}
