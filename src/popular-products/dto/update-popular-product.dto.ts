import { IsBoolean, IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdatePopularProductDto {
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
