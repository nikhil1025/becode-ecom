import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminJwtAuthGuard } from '../auth/admin-jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import { NewsletterService } from './newsletter.service';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly service: NewsletterService) {}

  @Post('subscribe')
  subscribe(@Body() dto: SubscribeNewsletterDto) {
    return this.service.subscribe(dto);
  }
}

@Controller('admin/newsletter')
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPERADMIN')
export class NewsletterAdminController {
  constructor(private readonly service: NewsletterService) {}

  @Get()
  findAll(@Query('isActive') isActive?: string) {
    const active =
      isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.service.findAll(active);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Patch(':id/toggle')
  toggleActive(@Param('id') id: string) {
    return this.service.toggleActive(id);
  }
}
