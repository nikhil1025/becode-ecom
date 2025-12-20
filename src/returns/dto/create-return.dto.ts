
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ReturnItemDto } from './return-item.dto';

// Corresponds to the Prisma enum
export enum ReturnTypeEnum {
  RETURN = 'RETURN',
  EXCHANGE = 'EXCHANGE',
}

export class CreateReturnDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsEnum(ReturnTypeEnum)
  type: ReturnTypeEnum;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsNotEmpty()
  items: string; // This will be a JSON string of ReturnItemDto[]
}

