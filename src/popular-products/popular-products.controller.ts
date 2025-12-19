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
import { CreatePopularProductDto } from './dto/create-popular-product.dto';
import { UpdatePopularProductDto } from './dto/update-popular-product.dto';
import { PopularProductsService } from './popular-products.service';

@Controller('admin/popular-products')
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPERADMIN')
export class PopularProductsController {
  constructor(private readonly service: PopularProductsService) {}

  @Post()
  create(@Body() dto: CreatePopularProductDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdatePopularProductDto) {
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
