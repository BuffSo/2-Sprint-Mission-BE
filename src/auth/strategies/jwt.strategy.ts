import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './jwt-payload.interface';
import { UserService } from 'src/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      //secretOrKey: process.env.JWT_SECRET,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    //console.log('payload', payload);
    if (!payload || !payload.userId) {
      throw new UnauthorizedException(); // payload에 userId가 없으면 인증 실패
    }

    const user = await this.userService.getById(payload.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return { userId: payload.userId }; // req.user에 설정됨
  }
}
