import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { PrismaService } from '../prisma.service';
import { S3Service } from '../storage/s3.service';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [MailModule],
  controllers: [ReviewsController],
  providers: [ReviewsService, PrismaService, S3Service],
  exports: [ReviewsService],
})
export class ReviewsModule {}
