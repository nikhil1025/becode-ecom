import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { S3Service } from '../storage/s3.service';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  providers: [ProductsService, PrismaService, S3Service],
  controllers: [ProductsController],
})
export class ProductsModule {}
