import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { $Enums } from '@prisma/client';
import { AdminJwtAuthGuard } from '../auth/admin-jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  async findAll(
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('search') search?: string,
    @Query('featured') featured?: string,
  ) {
    return this.productsService.findAll({
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      search,
      featured: featured === 'true',
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  @UseInterceptors(FilesInterceptor('images', 10))
  async create(
    @Body() data: CreateProductDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ): Promise<any> {
    const imageUrls =
      images && images.length > 0
        ? await this.productsService.uploadProductImages(images)
        : [];
    return this.productsService.create({ ...data, images: imageUrls });
  }

  @Put(':id')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  @UseInterceptors(FilesInterceptor('images', 10))
  async update(
    @Param('id') id: string,
    @Body() data: UpdateProductDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ): Promise<any> {
    const imageUrls =
      images && images.length > 0
        ? await this.productsService.uploadProductImages(images)
        : undefined;
    return this.productsService.update(id, {
      ...data,
      ...(imageUrls && imageUrls.length > 0 && { images: imageUrls }),
    });
  }

  @Delete(':id')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  async delete(@Param('id') id: string): Promise<any> {
    return this.productsService.delete(id);
  }

  @Post(':id/images')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<any> {
    return this.productsService.uploadImages(id, files);
  }
}
