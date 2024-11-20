import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import userService from '../../services/userService.js'

const accessTokenOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  // issuer: 'enter issuer here',
  // audience: 'enter audience here',  
};

// const cookieExtractor = function(req) {
//     var token = null;
//     if (req && req.cookies) {
//         token = req.cookies['refreshToken'];
//     }
//     return token;
// };

// const refreshTokenOptions = {
//     jwtFromRequest: cookieExtractor,
//     secretOrKey: process.env.JWT_SECRET,
// }

const refreshTokenOptions = {
  jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'), // 요청 바디에서 refreshToken 추출
  secretOrKey: process.env.JWT_SECRET,
};

async function jwtVerify(payload, done) {
  //console.log('Decoded JWT Payload:', payload); // 디버깅용
  try {
    const user = await userService.getUserById(payload.userId);
    if (!user) {
      return done(null, false);
    }
    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
}

const accessTokenStrategy = new JwtStrategy(accessTokenOptions, jwtVerify);
const refreshTokenStrategy = new JwtStrategy(refreshTokenOptions, jwtVerify);

export {
  accessTokenStrategy,
  refreshTokenStrategy,
};
