import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  NavigationAdminController,
  NavigationController,
} from './navigation.controller';
import { NavigationService } from './navigation.service';

@Module({
  providers: [NavigationService, PrismaService],
  controllers: [NavigationController, NavigationAdminController],
})
export class NavigationModule {}
