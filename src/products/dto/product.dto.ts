import { ProductStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

class ProductImageDto {
  @IsString()
  @IsUrl()
  url: string;

  @IsString()
  @IsOptional()
  alt?: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}

class ProductVariantDto {
  @IsString()
  sku: string;

  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsOptional()
  attributes?: Record<string, any>;
}

export class CreateProductDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  shortDescription?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  sku: string;

  @IsNumber()
  @Min(0)
  regularPrice: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  salePrice?: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  brandId?: string;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsBoolean()
  @IsOptional()
  isNewArrival?: boolean;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  @IsOptional()
  images?: ProductImageDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  @IsOptional()
  variants?: ProductVariantDto[];

  @IsOptional()
  specifications?: Record<string, any>;

  @IsOptional()
  tags?: string[];
}

export class UpdateProductDto {
  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  shortDescription?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  regularPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  salePrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  brandId?: string;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsBoolean()
  @IsOptional()
  isNewArrival?: boolean;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  @IsOptional()
  images?: ProductImageDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  @IsOptional()
  variants?: ProductVariantDto[];

  @IsOptional()
  specifications?: Record<string, any>;

  @IsOptional()
  tags?: string[];
}
