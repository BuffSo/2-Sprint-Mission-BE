import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsOptional()
  nickname?: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
