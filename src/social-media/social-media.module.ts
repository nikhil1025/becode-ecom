import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SocialMediaController } from './social-media.controller';
import { SocialMediaService } from './social-media.service';

@Module({
  controllers: [SocialMediaController],
  providers: [SocialMediaService, PrismaService],
  exports: [SocialMediaService],
})
export class SocialMediaModule {}
