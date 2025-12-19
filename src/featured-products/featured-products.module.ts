import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { FeaturedProductsController } from './featured-products.controller';
import { FeaturedProductsService } from './featured-products.service';

@Module({
  providers: [FeaturedProductsService, PrismaService],
  controllers: [FeaturedProductsController],
})
export class FeaturedProductsModule {}
