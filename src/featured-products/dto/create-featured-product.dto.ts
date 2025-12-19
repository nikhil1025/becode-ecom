import { IsBoolean, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateFeaturedProductDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  priority?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
