import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  CommunityAdminController,
  CommunityController,
} from './community.controller';
import { CommunityService } from './community.service';

@Module({
  providers: [CommunityService, PrismaService],
  controllers: [CommunityController, CommunityAdminController],
})
export class CommunityModule {}
