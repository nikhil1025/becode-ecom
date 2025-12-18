import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { S3Service } from '../storage/s3.service';
import { BrandsController } from './brands.controller';
import { BrandsService } from './brands.service';

@Module({
  controllers: [BrandsController],
  providers: [BrandsService, PrismaService, S3Service],
})
export class BrandsModule {}
