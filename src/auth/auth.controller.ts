import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
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
}
