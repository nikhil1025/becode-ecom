import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminJwtAuthGuard } from '../auth/admin-jwt-auth.guard';
import { imageFileFilter } from '../common/utils/file-filters';
import { CollectionsService } from './collections.service';
import {
  AddProductsToCollectionDto,
  RemoveProductsFromCollectionDto,
  ReorderProductsDto,
} from './dto/add-products-to-collection.dto';
import { CollectionFiltersDto } from './dto/collection-filters.dto';
import {
  CollectionStatus,
  CreateCollectionDto,
} from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Controller('admin/collections')
@UseGuards(AdminJwtAuthGuard)
export class AdminCollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  /**
   * Create a new collection
   * POST /admin/collections
   * Accepts multipart/form-data with optional bannerImage file
   */
  @Post()
  @UseInterceptors(
    FileInterceptor('bannerImage', { fileFilter: imageFileFilter }),
  )
  async create(
    @Body() dto: CreateCollectionDto,
    @UploadedFile() bannerImage?: Express.Multer.File,
  ) {
    // Upload banner image to S3 if provided
    if (bannerImage) {
      const imageUrl =
        await this.collectionsService.uploadBannerImage(bannerImage);
      dto.bannerImage = imageUrl;
    }
    return this.collectionsService.create(dto);
  }

  /**
   * Get all collections with filters (admin)
   * GET /admin/collections
   */
  @Get()
  async findAll(@Query() filters: CollectionFiltersDto) {
    return this.collectionsService.findAll(filters, false);
  }

  /**
   * Get a single collection by ID (admin)
   * GET /admin/collections/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.collectionsService.findOne(id, false);
  }

  /**
   * Update a collection
   * PUT /admin/collections/:id
   * Accepts multipart/form-data with optional bannerImage file
   */
  @Put(':id')
  @UseInterceptors(
    FileInterceptor('bannerImage', { fileFilter: imageFileFilter }),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCollectionDto,
    @UploadedFile() bannerImage?: Express.Multer.File,
  ) {
    // Upload new banner image to S3 if provided
    if (bannerImage) {
      const imageUrl =
        await this.collectionsService.uploadBannerImage(bannerImage);
      dto.bannerImage = imageUrl;
    }
    return this.collectionsService.update(id, dto);
  }

  /**
   * Update collection status
   * PATCH /admin/collections/:id/status
   */
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: CollectionStatus,
  ) {
    return this.collectionsService.updateStatus(id, status);
  }

  /**
   * Soft delete a collection
   * DELETE /admin/collections/:id
   */
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.collectionsService.delete(id);
  }

  /**
   * Restore a deleted collection
   * POST /admin/collections/:id/restore
   */
  @Post(':id/restore')
  async restore(@Param('id') id: string) {
    return this.collectionsService.restore(id);
  }

  /**
   * Add products to a collection
   * POST /admin/collections/:id/products
   */
  @Post(':id/products')
  async addProducts(
    @Param('id') id: string,
    @Body() dto: AddProductsToCollectionDto,
  ) {
    return this.collectionsService.addProducts(id, dto);
  }

  /**
   * Remove products from a collection
   * DELETE /admin/collections/:id/products
   */
  @Delete(':id/products')
  async removeProducts(
    @Param('id') id: string,
    @Body() dto: RemoveProductsFromCollectionDto,
  ) {
    return this.collectionsService.removeProducts(id, dto);
  }

  /**
   * Reorder products in a collection
   * PUT /admin/collections/:id/products/reorder
   */
  @Put(':id/products/reorder')
  async reorderProducts(
    @Param('id') id: string,
    @Body() dto: ReorderProductsDto,
  ) {
    return this.collectionsService.reorderProducts(id, dto);
  }

  /**
   * Search products for selection
   * GET /admin/collections/search/products
   */
  @Get('search/products')
  async searchProducts(
    @Query('q') query: string,
    @Query('collectionId') collectionId?: string,
  ) {
    return this.collectionsService.searchProductsForSelection(
      query,
      collectionId,
    );
  }

  /**
   * Validate collection for publishing
   * POST /admin/collections/:id/validate
   */
  @Post(':id/validate')
  async validateForPublishing(@Param('id') id: string) {
    await this.collectionsService.validateCollectionForPublishing(id);
    return { message: 'Collection is valid for publishing' };
  }
}
