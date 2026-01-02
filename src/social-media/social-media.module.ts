import { Module } from '@nestjs/common';
import { SocialMediaController } from './social-media.controller';
import { SocialMediaService } from './social-media.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [SocialMediaController],
  providers: [SocialMediaService, PrismaService],
  exports: [SocialMediaService],
})
export class SocialMediaModule {}
