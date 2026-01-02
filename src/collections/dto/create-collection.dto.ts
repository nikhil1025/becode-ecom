import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export enum CollectionStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  SCHEDULED = 'SCHEDULED',
  EXPIRED = 'EXPIRED',
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export class CreateCollectionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  bannerImage?: string;

  @IsString()
  @IsOptional()
  offerText?: string;

  @IsEnum(DiscountType)
  @IsOptional()
  discountType?: DiscountType;

  @IsNumber()
  @IsOptional()
  @Min(0)
  discountValue?: number;

  @IsEnum(CollectionStatus)
  @IsOptional()
  status?: CollectionStatus;

  @IsNumber()
  @IsOptional()
  @Min(0)
  priority?: number;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;
}
