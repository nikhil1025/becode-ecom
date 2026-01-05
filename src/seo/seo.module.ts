import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SeoController } from './seo.controller';
import { SeoService } from './seo.service';

@Module({
  controllers: [SeoController],
  providers: [SeoService, PrismaService],
  exports: [SeoService],
})
export class SeoModule {}
