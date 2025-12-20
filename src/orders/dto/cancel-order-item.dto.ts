
import { IsNotEmpty, IsString } from 'class-validator';

export class CancelOrderItemDto {
  @IsString()
  @IsNotEmpty()
  orderItemId: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
