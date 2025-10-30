import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { TOKEN_EXPIRATION } from 'src/config/jwt.config';
import { UserRepository } from 'src/user/user.repository';
import { GoogleProfile } from './strategies/google.strategy';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async signIn(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 일치하지 않습니다.',
      );
    }

    // SNS 전용 계정 (password가 null)인 경우
    if (!user.password) {
      throw new UnauthorizedException(
        'SNS 로그인으로 가입된 계정입니다. Google 로그인을 이용해주세요.',
      );
    }

    // 비밀번호 검증
    if (!(await bcrypt.compare(password, user.password))) {
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

    const updatedUser = await this.userRepository.update(user.id, {
      refreshToken,
    });

    return {
      accessToken,
      refreshToken,
      user: this.userService.filterSensitiveUserData(updatedUser),
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      // RefreshToken 검증
      const payload = this.jwtService.verify(refreshToken);

      // 사용자 확인
      const user = await this.userRepository.findById(payload.userId);
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

  // OAuth 사용자 검증 및 생성/연동
  async validateOAuthUser(profile: GoogleProfile) {
    const { email, providerId, provider, name, picture } = profile;

    // 이메일로 기존 사용자 찾기
    let user = await this.userRepository.findByEmail(email);

    if (user) {
      // 기존 사용자가 있으면 SocialAccount 확인 및 생성
      const existingSocial = await this.prisma.socialAccount.findUnique({
        where: {
          provider_providerId: {
            provider,
            providerId,
          },
        },
      });

      // SocialAccount가 없으면 생성 (Auto Link)
      if (!existingSocial) {
        await this.prisma.socialAccount.create({
          data: {
            userId: user.id,
            provider,
            providerId,
          },
        });
      }

      // 프로필 정보 업데이트 (최신 소셜 로그인 정보로)
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          nickname: name,
          image: picture,
        },
      });
    } else {
      // 새 사용자 생성 (password는 null)
      user = await this.prisma.user.create({
        data: {
          email,
          nickname: name,
          image: picture,
          password: null, // SNS 전용 계정
          socials: {
            create: {
              provider,
              providerId,
            },
          },
        },
      });
    }

    return user;
  }

  // OAuth용 JWT 토큰 생성
  async generateTokensForOAuth(user: any) {
    const payload = { userId: user.id };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: TOKEN_EXPIRATION.ACCESS,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: TOKEN_EXPIRATION.REFRESH,
    });

    // RefreshToken을 DB에 저장
    const updatedUser = await this.userRepository.update(user.id, {
      refreshToken,
    });

    return {
      accessToken,
      refreshToken,
      user: this.userService.filterSensitiveUserData(updatedUser),
    };
  }
}
