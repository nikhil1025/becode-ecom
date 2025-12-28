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
import {
  AnyFilesInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { $Enums } from '@prisma/client';
import { AdminJwtAuthGuard } from '../auth/admin-jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { imageFileFilter } from '../common/utils/file-filters';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { ProductsService } from './products.service';

/**
 * Admin Products Controller
 * Dedicated endpoints for admin product management
 * All endpoints require admin authentication
 */
@Controller('admin/products')
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles($Enums.UserRole.ADMIN, $Enums.UserRole.SUPERADMIN)
export class AdminProductsController {
  constructor(private productsService: ProductsService) {}

  /**
   * GET /admin/products
   * List all products (DRAFT + PUBLISHED) with pagination
   * Add ?includeDeleted=true to show deleted products
   */
  @Get()
  async listProducts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    return this.productsService.findAllAdmin({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      search,
      status,
      includeDeleted: includeDeleted === 'true',
    });
  }

  /**
   * GET /admin/products/:id
   * Get single product with full details (for editing)
   */
  @Get(':id')
  async getProduct(@Param('id') id: string) {
    return this.productsService.findOneForAdmin(id);
  }

  /**
   * POST /admin/products
   * Create new product
   */
  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async createProduct(@Body() data: CreateProductDto) {
    return this.productsService.create(data);
  }

  /**
   * PUT /admin/products/:id
   * Update existing product
   */
  @Put(':id')
  @UseInterceptors(AnyFilesInterceptor())
  async updateProduct(@Param('id') id: string, @Body() data: UpdateProductDto) {
    // If status is being set to PUBLISHED, validate variants
    if (data.status === 'PUBLISHED') {
      await this.productsService.validateProductForPublishing(id);
    }

    return this.productsService.update(id, data);
  }

  /**
   * DELETE /admin/products/:id
   * Soft delete product
   */
  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return this.productsService.delete(id);
  }

  /**
   * GET /admin/products/deleted/list
   * List soft-deleted products
   */
  @Get('deleted/list')
  async listDeletedProducts() {
    return this.productsService.findDeletedProducts();
  }

  /**
   * PUT /admin/products/:id/restore
   * Restore soft-deleted product
   */
  @Put(':id/restore')
  async restoreProduct(@Param('id') id: string) {
    return this.productsService.restore(id);
  }

  /**
   * DELETE /admin/products/:id/force
   * Permanently delete product (SUPERADMIN only)
   */
  @Delete(':id/force')
  @Roles($Enums.UserRole.SUPERADMIN)
  async forceDeleteProduct(@Param('id') id: string) {
    return this.productsService.forceDeleteProduct(id);
  }

  /**
   * POST /admin/products/:id/images
   * Upload product images
   */
  @Post(':id/images')
  @UseInterceptors(
    FilesInterceptor('files', 10, { fileFilter: imageFileFilter }),
  )
  async uploadImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productsService.uploadImages(id, files);
  }

  /**
   * GET /admin/products/search/query
   * Search products for CMS selection
   */
  @Get('search/query')
  async searchProducts(@Query('q') query?: string) {
    return this.productsService.searchProducts(query);
  }
}
