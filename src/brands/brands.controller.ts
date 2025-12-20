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
import { imageFileFilter } from '../common/utils/file-filters';
import { BrandsService } from './brands.service';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  async findAll() {
    return this.brandsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    return this.brandsService.findOne(id);
  }

  @Post()
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  @UseInterceptors(FileInterceptor('logo', { fileFilter: imageFileFilter }))
  async create(
    @Body() data: { name: string; slug: string },
    @UploadedFile() logo?: Express.Multer.File,
  ): Promise<any> {
    const logoUrl = logo
      ? await this.brandsService.uploadLogo(logo)
      : undefined;
    return this.brandsService.create({ ...data, logo: logoUrl });
  }

  @Put(':id')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  @UseInterceptors(FileInterceptor('logo', { fileFilter: imageFileFilter }))
  async update(
    @Param('id') id: string,
    @Body() data: { name?: string; slug?: string },
    @UploadedFile() logo?: Express.Multer.File,
  ): Promise<any> {
    const logoUrl = logo
      ? await this.brandsService.uploadLogo(logo)
      : undefined;
    return this.brandsService.update(id, {
      ...data,
      ...(logoUrl && { logo: logoUrl }),
    });
  }

  @Delete(':id')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  async delete(@Param('id') id: string) {
    return this.brandsService.delete(id);
  }
}
