import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminJwtAuthGuard } from '../auth/admin-jwt-auth.guard';
import { VariantsListingService } from './variants-listing.service';

@Controller('variants')
export class VariantsListingController {
  constructor(private variantsListingService: VariantsListingService) {}

  /**
   * PUBLIC: Get variant listings for frontend
   * Used for category pages, search results, homepage sections
   */
  @Get()
  async getVariantListings(
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('search') search?: string,
    @Query('inStock') inStock?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: 'price' | 'createdAt' | 'name',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.variantsListingService.getVariantListings({
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      search,
      inStock: inStock === 'true',
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      sortBy,
      sortOrder,
    });
  }

  /**
   * PUBLIC: Get single variant details
   */
  @Get(':id')
  async getVariantById(@Param('id') id: string) {
    return this.variantsListingService.getVariantById(id);
  }

  /**
   * PUBLIC: Get all variants for a specific product
   * Used for PDP variant selector
   */
  @Get('product/:productId')
  async getProductVariants(@Param('productId') productId: string) {
    return this.variantsListingService.getProductVariants(productId);
  }

  /**
   * PUBLIC: Validate variant stock
   */
  @Get(':id/validate-stock/:quantity')
  async validateVariantStock(
    @Param('id') id: string,
    @Param('quantity') quantity: string,
  ) {
    return this.variantsListingService.validateVariantStock(
      id,
      parseInt(quantity),
    );
  }

  /**
   * ADMIN: Add images to variant
   */
  @Post(':id/images')
  @UseGuards(AdminJwtAuthGuard)
  async addVariantImages(
    @Param('id') id: string,
    @Body()
    body: {
      images: Array<{
        url: string;
        altText?: string;
        position?: number;
        isPrimary?: boolean;
      }>;
    },
  ) {
    await this.variantsListingService.addVariantImages(id, body.images);
    return { message: 'Images added successfully' };
  }

  /**
   * ADMIN: Delete variant image
   */
  @Delete('images/:imageId')
  @UseGuards(AdminJwtAuthGuard)
  async deleteVariantImage(@Param('imageId') imageId: string) {
    await this.variantsListingService.deleteVariantImage(imageId);
    return { message: 'Image deleted successfully' };
  }

  /**
   * ADMIN: Set primary image
   */
  @Patch(':variantId/images/:imageId/primary')
  @UseGuards(AdminJwtAuthGuard)
  async setPrimaryImage(
    @Param('variantId') variantId: string,
    @Param('imageId') imageId: string,
  ) {
    await this.variantsListingService.setPrimaryImage(variantId, imageId);
    return { message: 'Primary image set successfully' };
  }
}
