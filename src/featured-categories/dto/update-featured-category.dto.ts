import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateFeaturedCategoryDto {
  @IsInt()
  @Min(0)
  @IsOptional()
  priority?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
