// src/logger/logger.module.ts
import { Module, Global } from '@nestjs/common';
import * as winston from 'winston';
import { Logger } from 'winston';
import { winstonConfig } from './logger.config';

@Global()
@Module({
  providers: [
    {
      provide: 'PURE_WINSTON_LOGGER',
      useFactory: (): Logger => {
        // 진짜 Winston Logger를 생성해서 반환
        return winston.createLogger(winstonConfig);
      },
    },
  ],
  exports: ['PURE_WINSTON_LOGGER'],
})
export class LoggerModule {}
