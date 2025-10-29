import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleProfile } from './strategies/google.strategy';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  // 회원가입
  @Post('signUp')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // 로그인
  @Post('signIn')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;
    return await this.authService.signIn(email, password);
  }

  // 로그아웃
  //@UseGuards(AuthGuard('jwt'))
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request & { user: { userId: string } }) {
    const userId = req.user.userId;

    // 사용자 데이터에서 리프레시 토큰 제거
    await this.userService.update(userId, { refreshToken: null });
    return { message: '로그아웃 되었습니다.' };
  }

  // 토큰 갱신
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() body: { refreshToken: string }) {
    return await this.authService.refreshToken(body.refreshToken);
  }

  // Google OAuth 시작
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Guard가 Google OAuth flow를 시작함
  }

  // Google OAuth 콜백
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Req() req: Request & { user: GoogleProfile },
    @Res() res: Response,
  ) {
    try {
      // GoogleStrategy에서 검증된 profile 정보
      const profile = req.user;

      // 사용자 검증 및 생성/연동
      const user = await this.authService.validateOAuthUser(profile);

      // JWT 토큰 생성
      const tokens = await this.authService.generateTokensForOAuth(user);

      // Frontend로 리다이렉트 (토큰을 쿼리 파라미터로 전달)
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const redirectUrl = `${frontendUrl}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`;

      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      return res.redirect(`${frontendUrl}/signin?error=oauth_failed`);
    }
  }
}
