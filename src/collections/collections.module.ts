import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { PrismaService } from '../prisma.service';
import { AdminCollectionsController } from './admin-collections.controller';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';

@Module({
  imports: [CommonModule],
  controllers: [CollectionsController, AdminCollectionsController],
  providers: [CollectionsService, PrismaService],
  exports: [CollectionsService],
})
export class CollectionsModule {}
