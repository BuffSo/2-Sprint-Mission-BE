import { IsString, MinLength, IsOptional } from 'class-validator';

export class ChangePasswordDto {
  @IsOptional()
  @IsString()
  currentPassword?: string; // SNS 사용자는 선택사항

  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  newPassword: string;

  @IsString()
  verificationCode: string; // 이메일 인증 코드
}
