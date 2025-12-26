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
import { PublicVariantDto } from './dto/variant.dto';
import { ProductsService } from './products.service';
import { VariantsService } from './variants.service';

@Controller('products')
export class ProductsController {
  constructor(
    private productsService: ProductsService,
    private variantsService: VariantsService,
  ) {}

  // Public endpoint for users/guests - limited data
  @Get()
  async findAll(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('featured') featured?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.productsService.findAll({
      category,
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

  // Public endpoint to get variants for a product by slug
  @Get('slug/:slug/variants')
  async getVariantsBySlug(
    @Param('slug') slug: string,
  ): Promise<PublicVariantDto[]> {
    const product = await this.productsService.findBySlug(slug);
    return this.variantsService.getPublicVariantsByProduct(product.id);
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

  // Admin endpoint for searching products (for CMS selection)
  @Get('admin/search')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  async searchProducts(@Query('q') query?: string) {
    return this.productsService.searchProducts(query);
  }

  // Admin endpoint for product preview (includes inactive variants)
  @Get('admin/preview/:id')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  async previewProduct(@Param('id') id: string): Promise<any> {
    // Admin preview includes ALL variants (active + inactive)
    return this.productsService.findOneForAdmin(id);
  }

  // Public endpoint for single product by ID (legacy)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  async create(@Body() data: CreateProductDto): Promise<any> {
    // Images are now managed at variant level only
    return this.productsService.create(data);
  }

  @Put(':id')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
  async update(
    @Param('id') id: string,
    @Body() data: UpdateProductDto,
  ): Promise<any> {
    // If status is being set to PUBLISHED, validate variants
    if (data.status === 'PUBLISHED') {
      await this.productsService.validateProductForPublishing(id);
    }

    // Images are now managed at variant level only
    return this.productsService.update(id, data);
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
