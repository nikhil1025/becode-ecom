import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AdminJwtAuthGuard } from '../auth/admin-jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { imageFileFilter } from '../common/utils/file-filters';
import {
  CreateVariantDto,
  UpdateVariantDto,
  VariantResponseDto,
} from './dto/variant.dto';
import { VariantsService } from './variants.service';

@Controller('admin/variants')
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPERADMIN')
export class AdminVariantsController {
  constructor(private variantsService: VariantsService) {}

  /**
   * Create a new variant for a product
   * POST /admin/variants/:productId
   */
  @Post(':productId')
  async createVariant(
    @Param('productId') productId: string,
    @Body() createVariantDto: CreateVariantDto,
  ): Promise<VariantResponseDto> {
    return this.variantsService.createVariant(productId, createVariantDto);
  }

  /**
   * Get all variants for a product
   * GET /admin/variants/product/:productId
   */
  @Get('product/:productId')
  async getVariantsByProduct(
    @Param('productId') productId: string,
  ): Promise<VariantResponseDto[]> {
    return this.variantsService.getVariantsByProduct(productId);
  }

  /**
   * Get a single variant by ID
   * GET /admin/variants/:variantId
   */
  @Get(':variantId')
  async getVariantById(
    @Param('variantId') variantId: string,
  ): Promise<VariantResponseDto> {
    return this.variantsService.getVariantById(variantId);
  }

  /**
   * Update a variant
   * PUT /admin/variants/:variantId
   */
  @Put(':variantId')
  async updateVariant(
    @Param('variantId') variantId: string,
    @Body() updateVariantDto: UpdateVariantDto,
  ): Promise<VariantResponseDto> {
    return this.variantsService.updateVariant(variantId, updateVariantDto);
  }

  /**
   * Delete a variant
   * DELETE /admin/variants/:variantId
   */
  @Delete(':variantId')
  async deleteVariant(@Param('variantId') variantId: string): Promise<void> {
    return this.variantsService.deleteVariant(variantId);
  }

  /**
   * Upload images for a variant
   * POST /admin/variants/:variantId/images
   */
  @Post(':variantId/images')
  @UseInterceptors(
    FilesInterceptor('images', 10, { fileFilter: imageFileFilter }),
  )
  async uploadVariantImages(
    @Param('variantId') variantId: string,
    @UploadedFiles() images: Express.Multer.File[],
  ): Promise<any> {
    return this.variantsService.uploadVariantImages(variantId, images);
  }

  /**
   * Delete a variant image
   * DELETE /admin/variants/:variantId/images/:imageId
   */
  @Delete(':variantId/images/:imageId')
  async deleteVariantImage(
    @Param('variantId') variantId: string,
    @Param('imageId') imageId: string,
  ): Promise<void> {
    return this.variantsService.deleteVariantImage(variantId, imageId);
  }
}
