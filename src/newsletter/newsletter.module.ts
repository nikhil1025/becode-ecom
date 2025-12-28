import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { PrismaService } from '../prisma.service';
import {
  NewsletterAdminController,
  NewsletterController,
} from './newsletter.controller';
import { NewsletterService } from './newsletter.service';

@Module({
  imports: [MailModule],
  providers: [NewsletterService, PrismaService],
  controllers: [NewsletterController, NewsletterAdminController],
})
export class NewsletterModule {}
