import { IsEmail, IsIn } from 'class-validator';

export class SendVerificationCodeDto {
  @IsEmail()
  email: string;

  @IsIn(['password-setup', 'password-reset'])
  type: 'password-setup' | 'password-reset';
}
