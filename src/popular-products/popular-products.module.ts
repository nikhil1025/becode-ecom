import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PopularProductsController } from './popular-products.controller';
import { PopularProductsService } from './popular-products.service';

@Module({
  providers: [PopularProductsService, PrismaService],
  controllers: [PopularProductsController],
})
export class PopularProductsModule {}
