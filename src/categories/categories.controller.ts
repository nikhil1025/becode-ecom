import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { $Enums } from '@prisma/client';
import { AdminJwtAuthGuard } from '../auth/admin-jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { imageFileFilter } from '../common/utils/file-filters';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll() {
    return this.categoriesService.findAll();
  }

  // Admin endpoint for searching categories (for CMS selection)
  @Get('admin/search')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  async searchCategories(@Query('q') query?: string) {
    return this.categoriesService.searchCategories(query);
  }

  // Public endpoint for single category by slug
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<any> {
    return this.categoriesService.findBySlug(slug);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    return this.categoriesService.findOne(id);
  }

  @Get(':id/subcategories')
  async getSubcategories(@Param('id') id: string): Promise<any[]> {
    return this.categoriesService.getSubcategories(id);
  }

  @Post()
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  @UseInterceptors(FileInterceptor('image', { fileFilter: imageFileFilter }))
  async create(
    @Body()
    data: {
      name: string;
      slug: string;
      description?: string;
      parentId?: string;
      position?: number;
    },
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<any> {
    const imageUrl = image
      ? await this.categoriesService.uploadImage(image)
      : undefined;
    return this.categoriesService.create({ ...data, image: imageUrl });
  }

  @Put(':id')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  @UseInterceptors(FileInterceptor('image', { fileFilter: imageFileFilter }))
  async update(
    @Param('id') id: string,
    @Body()
    data: {
      name?: string;
      slug?: string;
      description?: string;
      parentId?: string;
      position?: number;
    },
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<any> {
    const imageUrl = image
      ? await this.categoriesService.uploadImage(image)
      : undefined;
    return this.categoriesService.update(id, {
      ...data,
      ...(imageUrl && { image: imageUrl }),
    });
  }

  @Delete(':id')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  async delete(@Param('id') id: string) {
    return this.categoriesService.delete(id);
  }
}
