import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { $Enums, ContentType } from '@prisma/client';
import { AdminJwtAuthGuard } from '../auth/admin-jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SiteContentService } from './site-content.service';

@Controller('site-content')
export class SiteContentController {
  constructor(private readonly siteContentService: SiteContentService) {}

  @Get()
  findAll() {
    return this.siteContentService.findAll();
  }

  @Get(':type')
  findOne(@Param('type') type: string) {
    const contentType = type.toUpperCase() as ContentType;
    return this.siteContentService.findOne(contentType);
  }

  @Put(':type')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  update(
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
