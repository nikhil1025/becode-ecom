import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export enum RefundMethodEnum {
  BANK = 'BANK',
  WALLET = 'WALLET',
  ORIGINAL = 'ORIGINAL',
}

export class ExecuteRefundDto {
  @IsString()
  @IsNotEmpty()
  returnId: string;

  @IsString()
  @IsOptional()
  orderItemId?: string;

  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @IsEnum(RefundMethodEnum)
  @IsOptional()
  method?: RefundMethodEnum;

  @IsString()
  @IsOptional()
  adminUserId?: string;

  @IsString()
  @IsOptional()
  adminRemarks?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
