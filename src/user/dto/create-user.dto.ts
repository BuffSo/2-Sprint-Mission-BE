import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsOptional()
  nickname?: string;

  @IsOptional()
  @MinLength(8)
  password?: string;
}
