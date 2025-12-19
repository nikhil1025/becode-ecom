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
import { NavigationType } from './create-navigation.dto';

export class UpdateNavigationDto {
  @IsEnum(NavigationType)
  @IsOptional()
  type?: NavigationType;

  @IsUUID()
  @IsOptional()
  refId?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  label?: string;

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
