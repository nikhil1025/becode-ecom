import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

/**
 * DTO for creating a new product variant
 */
export class CreateVariantDto {
  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0, { message: 'Price must be a positive number' })
  price: number;

  @IsNumber()
  @Min(0, { message: 'Sale price must be a positive number' })
  @IsOptional()
  salePrice?: number;

  @IsNumber()
  @Min(0, { message: 'Cost price must be a positive number' })
  @IsOptional()
  costPrice?: number;

  @IsNumber()
  @Min(0, { message: 'Stock quantity must be a positive number' })
  stockQuantity: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  lowStockThreshold?: number;

  @IsObject()
  @IsNotEmpty()
  attributes: Record<string, string | number>;

  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;

  @IsObject()
  @IsOptional()
  dimensions?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

/**
 * DTO for updating an existing product variant
 */
export class UpdateVariantDto {
  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(0, { message: 'Price must be a positive number' })
  @IsOptional()
  price?: number;

  @IsNumber()
  @Min(0, { message: 'Sale price must be a positive number' })
  @IsOptional()
  salePrice?: number;

  @IsNumber()
  @Min(0, { message: 'Cost price must be a positive number' })
  @IsOptional()
  costPrice?: number;

  @IsNumber()
  @Min(0, { message: 'Stock quantity must be a positive number' })
  @IsOptional()
  stockQuantity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  lowStockThreshold?: number;

  @IsObject()
  @IsOptional()
  attributes?: Record<string, string | number>;

  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;

  @IsObject()
  @IsOptional()
  dimensions?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

/**
 * DTO for variant response
 */
export class VariantResponseDto {
  id: string;
  productId: string;
  sku: string;
  name: string;
  price: number;
  stockQuantity: number;
  attributes: Record<string, string | number>;
  isActive: boolean;
  images?: Array<{
    id: string;
    url: string;
    altText?: string;
    position: number;
    isPrimary: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO for user-facing minimal variant data
 */
export class PublicVariantDto {
  id: string;
  sku: string;
  name: string;
  price: number;
  stockQuantity: number;
  attributes: Record<string, string | number>;
  isActive: boolean;
}

/**
 * DTO for bulk variant operations
 */
export class BulkCreateVariantDto {
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants: CreateVariantDto[];
}
