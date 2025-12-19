import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  NewsletterAdminController,
  NewsletterController,
} from './newsletter.controller';
import { NewsletterService } from './newsletter.service';

@Module({
  providers: [NewsletterService, PrismaService],
  controllers: [NewsletterController, NewsletterAdminController],
})
export class NewsletterModule {}
