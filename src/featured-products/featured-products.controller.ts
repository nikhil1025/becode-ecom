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
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateFeaturedProductDto } from './dto/create-featured-product.dto';
import { UpdateFeaturedProductDto } from './dto/update-featured-product.dto';
import { FeaturedProductsService } from './featured-products.service';

@Controller('admin/featured-products')
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPERADMIN')
export class FeaturedProductsController {
  constructor(private readonly service: FeaturedProductsService) {}

  @Post()
  create(@Body() dto: CreateFeaturedProductDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('isActive') isActive?: string) {
    const active =
      isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.service.findAll(active);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFeaturedProductDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post('reorder')
  reorder(@Body() items: { id: string; priority: number }[]) {
    return this.service.reorder(items);
  }
}
