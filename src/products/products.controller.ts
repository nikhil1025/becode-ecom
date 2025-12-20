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
import { imageFileFilter } from '../common/utils/file-filters';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  // Public endpoint for users/guests - limited data
  @Get()
  async findAll(
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('search') search?: string,
    @Query('featured') featured?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.productsService.findAll({
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      search,
      featured: featured === 'true',
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  // Public endpoint for single product by slug
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<any> {
    return this.productsService.findBySlug(slug);
  }

  // Admin endpoint for full product data with pagination
  @Get('admin/all')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  async findAllAdmin(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.productsService.findAllAdmin({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      search,
      status,
    });
  }

  // Public endpoint for single product by ID (legacy)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  @UseInterceptors(
    FilesInterceptor('images', 10, { fileFilter: imageFileFilter }),
  )
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
  @UseInterceptors(
    FilesInterceptor('images', 10, { fileFilter: imageFileFilter }),
  )
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

  @Get('admin/deleted')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  async findDeleted() {
    return this.productsService.findDeletedProducts();
  }

  @Put(':id/restore')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  async restore(@Param('id') id: string) {
    return this.productsService.restore(id);
  }

  @Delete(':id/force')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.SUPERADMIN) // Only SUPERADMIN can force delete
  async forceDelete(@Param('id') id: string) {
    return this.productsService.forceDeleteProduct(id);
  }

  @Post(':id/images')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  @UseInterceptors(
    FilesInterceptor('files', 10, { fileFilter: imageFileFilter }),
  )
  async uploadImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<any> {
    return this.productsService.uploadImages(id, files);
  }
}
