import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  newPassword: string;

  @IsString()
  verificationCode: string; // 이메일 인증 코드
}
