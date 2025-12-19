import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { FeaturedCategoriesController } from './featured-categories.controller';
import { FeaturedCategoriesService } from './featured-categories.service';

@Module({
  providers: [FeaturedCategoriesService, PrismaService],
  controllers: [FeaturedCategoriesController],
})
export class FeaturedCategoriesModule {}
