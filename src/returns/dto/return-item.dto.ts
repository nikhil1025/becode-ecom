import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class ReturnItemDto {
  @IsString()
  @IsNotEmpty()
  orderItemId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  @IsOptional()
  exchangeProductId?: string;

  @IsString()
  @IsOptional()
  exchangeVariantId?: string;
}
