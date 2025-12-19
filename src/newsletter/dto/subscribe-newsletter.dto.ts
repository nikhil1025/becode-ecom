import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class SubscribeNewsletterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  name?: string;
}
