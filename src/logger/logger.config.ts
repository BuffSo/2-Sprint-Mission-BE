// src/logger/logger.config.ts
import * as winston from 'winston';
import { LoggerOptions } from 'winston';

export const winstonConfig: LoggerOptions = {
  transports: [
    // 콘솔에 출력
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({
          format: () =>
            new Date().toLocaleString('ko-KR', {
              timeZone: 'Asia/Seoul',
            }),
        }),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level}]: ${message}`;
        }),
      ),
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    }),
    // 에러 전용 로그
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp({
          format: () =>
            new Date().toLocaleString('ko-KR', {
              timeZone: 'Asia/Seoul',
            }),
        }),
        winston.format.json(),
      ),
    }),
    // 모든 로그
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp({
          format: () =>
            new Date().toLocaleString('ko-KR', {
              timeZone: 'Asia/Seoul',
            }),
        }),
        winston.format.json(),
      ),
    }),
  ],
};
