import { IsBoolean, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateFeaturedCategoryDto {
  @IsUUID()
  categoryId: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  priority?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
