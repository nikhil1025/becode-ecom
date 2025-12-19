import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SiteContentController } from './site-content.controller';
import { SiteContentService } from './site-content.service';

@Module({
  controllers: [SiteContentController],
  providers: [SiteContentService, PrismaService],
})
export class SiteContentModule {}
