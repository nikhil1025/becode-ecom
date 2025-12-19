import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateFeaturedProductDto {
  @IsInt()
  @Min(0)
  @IsOptional()
  priority?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
