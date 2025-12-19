import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { AdminJwtAuthGuard } from '../auth/admin-jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuditLogService } from '../common/audit-log.service';

@Controller('admin/audit-logs')
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
export class AuditLogController {
  constructor(private auditLog: AuditLogService) {}

  @Get()
  async getLogs(
    @Query('userId') userId?: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditLog.getLogs({
      userId,
      entityType,
      entityId,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    });
  }
}
