import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { PrismaService } from '../prisma.service';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [CommonModule],
  providers: [ProductsService, PrismaService],
  controllers: [ProductsController],
})
export class ProductsModule {}
