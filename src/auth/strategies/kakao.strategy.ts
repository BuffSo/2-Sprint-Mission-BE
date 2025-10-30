import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-kakao';

export interface KakaoProfile {
  provider: string;
  providerId: string;
  email: string;
  name: string;
  picture?: string;
}

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('KAKAO_CLIENT_ID'),
      clientSecret: configService.get<string>('KAKAO_CLIENT_SECRET'),
      callbackURL: configService.get<string>('KAKAO_CALLBACK_URL'),
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any, info?: any) => void,
  ): Promise<any> {
    const { id, username, _json } = profile;

    // Kakao profile을 표준 형식으로 변환
    const kakaoProfile: KakaoProfile = {
      provider: 'kakao',
      providerId: String(id), // Kakao ID는 숫자이므로 문자열로 변환
      email: _json.kakao_account?.email || '',
      name: _json.kakao_account?.profile?.nickname || username || '',
      picture: _json.kakao_account?.profile?.profile_image_url,
    };

    done(null, kakaoProfile);
  }
}
