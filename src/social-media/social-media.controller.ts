import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AdminJwtAuthGuard } from '../auth/admin-jwt-auth.guard';
import { SocialMediaService } from './social-media.service';

@Controller('social-media')
export class SocialMediaController {
  constructor(private readonly socialMediaService: SocialMediaService) {}

  // Public endpoint - get active social media links
  @Get('active')
  async getActive() {
    return this.socialMediaService.findActive();
  }

  // Admin endpoints
  @Get()
  @UseGuards(AdminJwtAuthGuard)
  async getAll() {
    return this.socialMediaService.findAll();
  }

  @Get(':id')
  @UseGuards(AdminJwtAuthGuard)
  async getOne(@Param('id') id: string) {
    return this.socialMediaService.findOne(id);
  }

  @Post()
  @UseGuards(AdminJwtAuthGuard)
  async create(
    @Body()
    data: {
      platform: string;
      url: string;
      icon?: string;
      isActive?: boolean;
      order?: number;
    },
  ) {
    return this.socialMediaService.create(data);
  }

  @Put(':id')
  @UseGuards(AdminJwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body()
    data: {
      platform?: string;
      url?: string;
      icon?: string;
      isActive?: boolean;
      order?: number;
    },
  ) {
    return this.socialMediaService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(AdminJwtAuthGuard)
  async delete(@Param('id') id: string) {
    return this.socialMediaService.delete(id);
  }

  @Post('reorder')
  @UseGuards(AdminJwtAuthGuard)
  async reorder(@Body() items: { id: string; order: number }[]) {
    return this.socialMediaService.reorder(items);
  }
}
