
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CancelOrderItemDto } from './cancel-order-item.dto';

export class CancelItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CancelOrderItemDto)
  items: CancelOrderItemDto[];
}
