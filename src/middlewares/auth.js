/**************************************************************
 * 미사용 코드: express-jwt를 사용하던 기존 인증 로직.        *
 * 현재는 passport-jwt를 사용하여 토큰 인증을 처리합니다.     *
 * 참고용으로 유지 중. 필요 없으면 삭제 가능.                 *
 **************************************************************/
import { expressjwt } from 'express-jwt';

const verifyAccessToken = expressjwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  requestProperty: 'user'       // 검증된 토큰의 페이로드를 req.user 에 저장
});

const verifyRefreshToken = expressjwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  getToken: (req) => req.cookies.refreshToken,
});

function passportAuthenticateSession(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  return next();
}

export default {
  verifyAccessToken,
  verifyRefreshToken,
  passportAuthenticateSession,
}