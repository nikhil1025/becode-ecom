import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { AdminJwtAuthGuard } from '../auth/admin-jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuditLogService } from '../common/audit-log.service';
import { PrismaService } from '../prisma.service';

@Controller('homepage-config')
export class HomepageConfigController {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  @Get()
  async getAll() {
    return await this.prisma.homepageConfig.findMany({
      orderBy: { sectionOrder: 'asc' },
    });
  }

  @Get(':key')
  async getByKey(@Param('key') key: string) {
    return await this.prisma.homepageConfig.findUnique({
      where: { key },
    });
  }

  @Put(':key')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  async update(
    @Param('key') key: string,
    @Body() data: any,
    @Request() req: any,
  ) {
    const oldConfig = await this.prisma.homepageConfig.findUnique({
      where: { key },
    });

    const updated = await this.prisma.homepageConfig.upsert({
      where: { key },
      update: data,
      create: { key, ...data },
    });

    // Log the change
    await this.auditLog.createLog({
      userId: req.user.id,
      action: 'UPDATE',
      entityType: 'HomepageConfig',
      entityId: updated.id,
      changes: { old: oldConfig, new: updated },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return updated;
  }

  @Put(':key/toggle')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  async toggleVisibility(@Param('key') key: string, @Request() req: any) {
    const config = await this.prisma.homepageConfig.findUnique({
      where: { key },
    });

    const updated = await this.prisma.homepageConfig.update({
      where: { key },
      data: { isEnabled: !config?.isEnabled },
    });

    // Log the change
    await this.auditLog.createLog({
      userId: req.user.id,
      action: 'TOGGLE_VISIBILITY',
      entityType: 'HomepageConfig',
      entityId: updated.id,
      changes: {
        old: { isEnabled: config?.isEnabled },
        new: { isEnabled: updated.isEnabled },
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return updated;
  }

  @Put('reorder')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  async reorder(
    @Body() items: { id: string; order: number }[],
    @Request() req: any,
  ) {
    await Promise.all(
      items.map((item) =>
        this.prisma.homepageConfig.update({
          where: { id: item.id },
          data: { sectionOrder: item.order },
        }),
      ),
    );

    // Log the change
    await this.auditLog.createLog({
      userId: req.user.id,
      action: 'REORDER',
      entityType: 'HomepageConfig',
      entityId: 'bulk',
      changes: { items },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return { success: true };
  }
}
