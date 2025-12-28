import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { PrismaService } from '../prisma.service';
import {
  CommunityAdminController,
  CommunityController,
} from './community.controller';
import { CommunityService } from './community.service';

@Module({
  imports: [MailModule],
  providers: [CommunityService, PrismaService],
  controllers: [CommunityController, CommunityAdminController],
})
export class CommunityModule {}
