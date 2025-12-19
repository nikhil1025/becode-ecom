import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';

@Module({
  controllers: [DeliveryController],
  providers: [DeliveryService, PrismaService],
})
export class DeliveryModule {}
