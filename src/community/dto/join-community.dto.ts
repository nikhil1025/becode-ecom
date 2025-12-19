import { IsEmail, IsString, MaxLength } from 'class-validator';

export class JoinCommunityDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(500)
  interest: string;
}
