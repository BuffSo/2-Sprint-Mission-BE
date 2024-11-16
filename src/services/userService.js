import userRepository from "../repositories/userRepository.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// 토큰 만료 시간
const TOKEN_EXPIRATION = {
  ACCESS: '1m',  
  REFRESH: '30d' 
  // ACCESS: '1h',  
  // REFRESH: '2w' 
};

async function hashingPassword(password) {
  return bcrypt.hash(password, 10);
}

function filterSensitiveUserData(user) {
  const { password, refreshToken, ...rest } = user;
  return rest;
}

async function verifyPassword(inputPassword, savedPassword) {
  const isVailid = await bcrypt.compare(inputPassword, savedPassword);
  if( !isVailid ) {
    const error = new Error('Unauthorized'); // 이메일, 비밀번호가 일치하지 않음
    error.code = 401;
    throw error;
  }
}

async function createUser(user) {
  const existedUser = await userRepository.findByEmail(user.email);

  if (existedUser) {
    const error = new Error('이미 사용중인 이메일입니다.');
    error.code = 422;
    error.data = { email: user.email };
    throw error;
  }

  const hashedPassword = await hashingPassword(user.password);
  const createdUser = await userRepository.save({ ...user, password: hashedPassword });
  return filterSensitiveUserData(createdUser);
}

async function getUser(email, password) {
  const user = await userRepository.findByEmail(email);
  if(!user) {
    const error = new Error('Unauthorized');  // 해당 이메일이 존재 하지 않음
    error.code = 401;                         // 404 ?
    throw error;
  }
  verifyPassword(password, user.password);  // 실패시 verifyPassword 함수 내에서 throw Error
  return filterSensitiveUserData(user);
}

async function getUserById(id) {
    if (!id) {
      const error = new Error('Invalid ID');
      error.code = 400; // 잘못된 요청을 나타내는 400 코드 사용
      throw error;
    }
  
  const user = await userRepository.findById(id);

  if( !user ) {
    const error = new Error('Not Found');
    error.code = 404;
    throw error;
  }

  return filterSensitiveUserData(user);  
}

async function updateUser(id, data) {
  return await userRepository.update(id, data);
}

function createToken(user, type) {
  const payload = { userId: user.id };
  const options = {
    expiresIn: type === 'refresh' ? TOKEN_EXPIRATION.REFRESH : TOKEN_EXPIRATION.ACCESS,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, options);
}

async function refreshToken(userId, refreshToken) {
  // console.log('refreshToken func() userId:', userId);
  // console.log('refreshToken func() refreshToken:', refreshToken);

  const user = await userRepository.findById(userId);

  // 사용자 또는 토큰 유효성 검사
  if (!user) {
    console.error('Error: User not found');
  } else if (user.refreshToken !== refreshToken) {
    console.error('Error: Refresh token mismatch');
    console.error('Stored refreshToken:', user.refreshToken);
  }

  if (!user || user.refreshToken !== refreshToken) {
    const error = new Error('Unauthorized');
    error.code = 401;
    throw error;
  }
  // 새로운 accessToken 및 refreshToken 생성
  const accessToken = createToken(user);  
  const newRefreshToken = createToken(user, 'refresh'); 

  return { accessToken, newRefreshToken };  
}

async function oauthCreateOrUpdate(provider, providerId, email, nickname) {
  const user = await userRepository.createOrUpdate(provider, providerId, email, nickname);
  return filterSensitiveUserData(user);
}

export default {
  createUser,
  getUser,
  getUserById,
  updateUser,
  createToken,
  refreshToken,
  oauthCreateOrUpdate,
}