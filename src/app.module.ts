import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './product/product.module';
import { CommentModule } from './comment/comment.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './logger/logger.config';
import * as fs from 'fs';
import { UploadModule } from './upload/upload.module';

// logs 폴더가 없으면 생성
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    WinstonModule.forRoot(winstonConfig), // logger.config.ts에서 설정 가져오기
    AuthModule,
    UserModule,
    PrismaModule,
    ProductModule,
    CommentModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
