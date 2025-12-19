import { Module } from '@nestjs/common';
import { AuditLogService } from '../common/audit-log.service';
import { PrismaService } from '../prisma.service';
import { HomepageConfigController } from './homepage-config.controller';

@Module({
  controllers: [HomepageConfigController],
  providers: [PrismaService, AuditLogService],
  exports: [AuditLogService],
})
export class HomepageConfigModule {}
