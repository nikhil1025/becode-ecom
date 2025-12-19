import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { $Enums, ContentStatus, ContentType } from '@prisma/client';
import { AdminJwtAuthGuard } from '../auth/admin-jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SiteContentService } from './site-content.service';

@Controller('cms')
export class SiteContentController {
  constructor(private readonly siteContentService: SiteContentService) {}

  // ============ USER ROUTES (Public) ============

  // Get published content by slug (user-facing)
  @Get('public/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.siteContentService.findBySlug(slug);
  }

  // ============ ADMIN ROUTES (Protected) ============

  // Get all CMS pages (admin)
  @Get('admin')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  findAll() {
    return this.siteContentService.findAll();
  }

  // Get specific CMS page for editing (admin)
  @Get('admin/:type')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  findOne(@Param('type') type: string) {
    const contentType = type.toUpperCase() as ContentType;
    return this.siteContentService.findOne(contentType);
  }

  // Create new CMS page (admin)
  @Post('admin')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  create(
    @Request() req: { user: { userId: string; email: string } },
    @Body()
    body: {
      type: string;
      title: string;
      content: string;
      status?: ContentStatus;
      metadata?: any;
    },
  ) {
    const contentType = body.type.toUpperCase() as ContentType;
    return this.siteContentService.create(
      contentType,
      body.title,
      body.content,
      body.status || ContentStatus.DRAFT,
      req.user.email,
      body.metadata,
    );
  }

  // Update CMS page (admin)
  @Put('admin/:type')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  update(
    @Request() req: { user: { userId: string; email: string } },
    @Param('type') type: string,
    @Body()
    body: {
      title?: string;
      content?: string;
      status?: ContentStatus;
      metadata?: any;
    },
  ) {
    const contentType = type.toUpperCase() as ContentType;
    return this.siteContentService.update(contentType, {
      ...body,
      lastUpdatedBy: req.user.email,
    });
  }

  // Publish CMS page (admin)
  @Put('admin/:type/publish')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  publish(
    @Request() req: { user: { userId: string; email: string } },
    @Param('type') type: string,
  ) {
    const contentType = type.toUpperCase() as ContentType;
    return this.siteContentService.publish(contentType, req.user.email);
  }

  // Unpublish CMS page (admin)
  @Put('admin/:type/unpublish')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  unpublish(
    @Request() req: { user: { userId: string; email: string } },
    @Param('type') type: string,
  ) {
    const contentType = type.toUpperCase() as ContentType;
    return this.siteContentService.unpublish(contentType, req.user.email);
  }

  // Soft delete CMS page (admin)
  @Delete('admin/:type')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  delete(@Param('type') type: string) {
    const contentType = type.toUpperCase() as ContentType;
    return this.siteContentService.delete(contentType);
  }

  // ============ BACKWARD COMPATIBILITY ============

  // Old site-content routes (kept for backward compatibility)
  @Get()
  findAllLegacy() {
    return this.siteContentService.findAll();
  }

  @Get(':type')
  findOneLegacy(@Param('type') type: string) {
    const contentType = type.toUpperCase() as ContentType;
    return this.siteContentService.findOne(contentType);
  }

  @Put(':type')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  updateLegacy(
    @Param('type') type: string,
    @Body() body: { title: string; content: string },
  ) {
    const contentType = type.toUpperCase() as ContentType;
    return this.siteContentService.upsert(
      contentType,
      body.title,
      body.content,
    );
  }
}
