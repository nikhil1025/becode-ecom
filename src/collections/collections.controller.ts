import { Controller, Get, Param, Query } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CollectionProductFiltersDto } from './dto/collection-filters.dto';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  /**
   * Get all active collections (public)
   * GET /collections
   */
  @Get()
  async findAll() {
    return this.collectionsService.findAll({}, true);
  }

  /**
   * Get active collections for homepage
   * GET /collections/active
   */
  @Get('active')
  async getActiveCollections() {
    return this.collectionsService.getActiveCollections();
  }

  /**
   * Get a single collection by slug or ID (public)
   * GET /collections/:idOrSlug
   */
  @Get(':idOrSlug')
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.collectionsService.findOne(idOrSlug, true);
  }

  /**
   * Get products in a collection with filters (public)
   * GET /collections/:idOrSlug/products
   */
  @Get(':idOrSlug/products')
  async getCollectionProducts(
    @Param('idOrSlug') idOrSlug: string,
    @Query() filters: CollectionProductFiltersDto,
  ) {
    return this.collectionsService.getCollectionProducts(idOrSlug, filters);
  }
}
