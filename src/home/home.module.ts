import { Module } from '@nestjs/common';
import { AuditLogController } from '../common/audit-log.controller';
import { AuditLogService } from '../common/audit-log.service';
import { PrismaService } from '../prisma.service';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { HomepageConfigController } from './homepage-config.controller';

@Module({
  providers: [HomeService, PrismaService, AuditLogService],
  controllers: [HomeController, HomepageConfigController, AuditLogController],
  exports: [AuditLogService],
})
export class HomeModule {}
