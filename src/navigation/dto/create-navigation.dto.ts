import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export enum NavigationType {
  CATEGORY = 'CATEGORY',
  COLLECTION = 'COLLECTION',
  PAGE = 'PAGE',
  CUSTOM = 'CUSTOM',
}

export class CreateNavigationDto {
  @IsEnum(NavigationType)
  type: NavigationType;

  @IsUUID()
  @IsOptional()
  refId?: string;

  @IsString()
  @MaxLength(100)
  label: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  url?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
