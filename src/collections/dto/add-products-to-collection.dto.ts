import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CollectionProductDto {
  @IsString()
  productId: string;

  @IsString()
  @IsOptional()
  variantId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class AddProductsToCollectionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CollectionProductDto)
  products: CollectionProductDto[];
}

export class RemoveProductsFromCollectionDto {
  @IsArray()
  @IsString({ each: true })
  productIds: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  variantIds?: string[];
}

export class ReorderProductsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductOrderItem)
  productOrder: ProductOrderItem[];
}

export class ProductOrderItem {
  @IsString()
  id: string;

  @IsNumber()
  @Min(0)
  position: number;
}
