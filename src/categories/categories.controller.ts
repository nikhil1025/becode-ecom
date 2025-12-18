import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { $Enums } from '@prisma/client';
import { AdminJwtAuthGuard } from '../auth/admin-jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll() {
    return this.categoriesService.findAll();
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
  @UseInterceptors(FileInterceptor('image'))
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
  @UseInterceptors(FileInterceptor('image'))
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
