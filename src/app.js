import * as dotenv from 'dotenv';
dotenv.config();  // 가장 먼저 호출하여 환경 변수를 로드

import express from "express";
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import cors from 'cors';

import userController from './controllers/userController.js';
import productController from './controllers/productController.js';
import articleController from './controllers/articleController.js';
import articleCommentController from './controllers/articleCommentController.js';
import productCommentController from './controllers/productCommentController.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  }),
);

app.use(express.json());       // JSON 요청 파싱 미들웨어
app.use(cookieParser());

app.use(passport.initialize());
app.use(passport.session());

const corsOptions = {
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'https://buffso-pandamarket.netlify.app',
    'https://buffso-pandamarket.vercel.app'
  ],
}
app.use(cors(corsOptions));

// // Content-Type 검사 미들웨어
// app.use((req, res, next) => {
//   // `PATCH`와 `POST` 요청에 대해 Content-Type을 검사
//   if ((req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT') && !req.is('application/json')) {
//     return res.status(400).send({ message: 'Content-Type must be application/json' });
//   }
//   next();
// });

// app.use((req, res, next) => {
//   if ((req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT') && req.body && !req.is('application/json')) {
//     return res.status(400).send({ message: 'Content-Type must be application/json' });
//   }
//   next();
// });

app.use('', userController);
app.use('/products', productController);
app.use('/products', productCommentController);
app.use('/articles', articleController);
app.use('/articles', articleCommentController);

// 404 Not Found 처리
app.use((req, res) => {
  res.status(404).send({
    message: `The endpoint for '${req.originalUrl}' does not exist`,
  });
});

// 에러 핸들러 미들웨어 (모든 라우트 뒤에 위치해야 함)
app.use(errorHandler);

const port = process.env.PORT ?? 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
