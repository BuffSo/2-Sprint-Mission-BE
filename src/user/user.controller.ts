import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { SendVerificationCodeDto } from './dto/send-verification-code.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: Request & { user: { userId: string } }) {
    const { userId } = req.user;
    const user = await this.userService.getById(userId);

    if (!user) {
      return { message: 'User not found' };
    }

    // 민감한 정보 필터링은 서비스 레이어에서 처리
    return user;
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.getById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  // 인증 코드 발송 API
  @UseGuards(JwtAuthGuard)
  @Post('send-verification-code')
  async sendVerificationCode(
    @Req() req: Request & { user: { userId: string } },
    @Body() sendVerificationCodeDto: SendVerificationCodeDto,
  ) {
    return this.userService.sendVerificationCode(
      req.user.userId,
      sendVerificationCodeDto,
    );
  }

  // 비밀번호 변경/설정 API
  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  async changePassword(
    @Req() req: Request & { user: { userId: string } },
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(req.user.userId, changePasswordDto);
  }
}
