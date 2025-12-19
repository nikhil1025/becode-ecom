import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

export class CreatePopularProductDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  priority?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  score?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
