import express from 'express';
import userService from '../services/userService.js';
import authMiddleware from '../middlewares/auth.js';
import passport from '../config/passport.js';

const RENEW_TOKEN_PATH = '/auth/refresh-token';

const userController = express.Router();

// 회원가입
userController.post('/auth/signUp', async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    return res.status(201).json(user);
  } catch (error) {
    next(error);
  }
})

// 토큰기반 로그인
userController.post('/auth/signIn', async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await userService.getUser(email, password);
    const accessToken = userService.createToken(user);
    const refreshToken = userService.createToken(user, 'refresh');
    await userService.updateUser(user.id, { refreshToken });
    res.cookie('refreshToken', refreshToken, { // 추가
      httpOnly: true,
      sameSite: 'none',
      //secure: true,
      secure: false,
      path: RENEW_TOKEN_PATH,
      maxAge: 1000 * 60 * 60,
    });    
    return res.json({ 
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        image: user.image,
        nickname: user.nickname,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

userController.post(RENEW_TOKEN_PATH, 
  passport.authenticate('refresh-token', { session: false }),
  async (req, res, next) => {
    try {
      const { refreshToken } = req.body; // 요청 바디에서 refreshToken 추출
      const { id: userId } = req.user;

      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
      }
      // 토큰 유효성 검사 및 토큰 갱신
      const { accessToken, newRefreshToken } = await userService.refreshToken(userId, refreshToken);
      //새로운 refreshToken 저장
      await userService.updateUser(userId, { refreshToken: newRefreshToken });

      return res.json({ accessToken });
    } catch (error) {
      console.error('토큰 갱신 중 오류:', error);
      return next(error);
    }
  }
);    

// 현재 로그인한 유저 정보 조회
userController.get('/users/me', authMiddleware.verifyAccessToken, async (req, res, next) => {
  //console.log("Decoded Token:", req.user);
  try {
    const user = await userService.getUserById(req.user.userId);      // req.user.id 가 아닌 userId 주의
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Filtered response with selected user fields
    return res.json({
      id: user.id,
      nickname: user.nickname,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    next(error);
  }
});

export default userController;