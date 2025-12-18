import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { S3Service } from '../storage/s3.service';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, PrismaService, S3Service],
})
export class CategoriesModule {}
