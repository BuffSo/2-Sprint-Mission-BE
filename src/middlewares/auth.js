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