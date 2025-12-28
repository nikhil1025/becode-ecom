import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { PrismaService } from '../prisma.service';
import { AdminProductsController } from './admin-products.controller';
import { AdminVariantsController } from './admin-variants.controller';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { VariantsListingController } from './variants-listing.controller';
import { VariantsListingService } from './variants-listing.service';
import { VariantsService } from './variants.service';

@Module({
  imports: [CommonModule],
  providers: [
    ProductsService,
    VariantsService,
    VariantsListingService,
    PrismaService,
  ],
  controllers: [
    ProductsController,
    AdminProductsController,
    AdminVariantsController,
    VariantsListingController,
  ],
  exports: [VariantsService, VariantsListingService],
})
export class ProductsModule {}
