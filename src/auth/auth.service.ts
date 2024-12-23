import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { TOKEN_EXPIRATION } from 'src/config/jwt.config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string) {
    const user = await this.userService.getByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 일치하지 않습니다.',
      );
    }

    // JWT 페이로드 생성
    const payload = { userId: user.id };

    // accessToken 및 refreshToken 생성
    const accessToken = this.jwtService.sign(payload); // 자동으로 설정된 'secret' 사용
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: TOKEN_EXPIRATION.REFRESH,
    });

    await this.userService.update(user.id, { refreshToken });

    return {
      accessToken,
      refreshToken,
      user: this.userService.filterSensitiveUserData(user),
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      // RefreshToken 검증
      const payload = this.jwtService.verify(refreshToken);

      // 사용자 확인
      const user = await this.userService.getById(payload.userId);
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // 새 AccessToken 발급
      const newAccessToken = this.jwtService.sign(
        { userId: user.id },
        { expiresIn: TOKEN_EXPIRATION.ACCESS },
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      console.error('Error during refresh token validation:', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
