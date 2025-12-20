
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class ReturnItemDto {
  @IsString()
  @IsNotEmpty()
  orderItemId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
