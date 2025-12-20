import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { PrismaService } from '../prisma.service';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

@Module({
  imports: [CommonModule],
  controllers: [CategoriesController],
  providers: [CategoriesService, PrismaService],
})
export class CategoriesModule {}
