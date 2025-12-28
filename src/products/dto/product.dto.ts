import { ProductStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
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
  @Transform(({ value }) => {
    if (typeof value === 'string') return value;
    return value?.toString() || '';
  })
  name: string;

  @IsString()
  @Transform(({ value }) => {
    if (typeof value === 'string') return value;
    return value?.toString() || '';
  })
  slug: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    return value?.toString();
  })
  shortDescription?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    return value?.toString();
  })
  description?: string;

  @IsString()
  @Transform(({ value }) => {
    if (typeof value === 'string') return value;
    return value?.toString() || '';
  })
  sku: string;

  // VARIANT-FIRST: Price and stock removed from Product level
  // These fields now belong to ProductVariant only

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  brandId?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  })
  isFeatured?: boolean;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  // VARIANT-FIRST: Images removed from Product level
  // Images now belong to ProductVariant only

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return undefined;
      }
    }
    return undefined;
  })
  variants?: ProductVariantDto[];

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'object' && !Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return undefined;
      }
    }
    return undefined;
  })
  specifications?: Record<string, any>;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [value];
      }
    }
    return undefined;
  })
  tags?: string[];
}

export class UpdateProductDto {
  @IsString()
  @MaxLength(255)
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    return value?.toString();
  })
  name?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    return value?.toString();
  })
  slug?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    return value?.toString();
  })
  shortDescription?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    return value?.toString();
  })
  description?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    return value?.toString();
  })
  sku?: string;

  // VARIANT-FIRST: Price and stock removed from Product level
  // These fields now belong to ProductVariant only

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  brandId?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'boolean') return value;
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  })
  isFeatured?: boolean;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  // VARIANT-FIRST: Images removed from Product level
  // Images now belong to ProductVariant only

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return undefined;
      }
    }
    return undefined;
  })
  variants?: ProductVariantDto[];

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'object' && !Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return undefined;
      }
    }
    return undefined;
  })
  specifications?: Record<string, any>;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [value];
      }
    }
    return undefined;
  })
  tags?: string[];
}
