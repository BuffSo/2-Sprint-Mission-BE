import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './logger/logger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Winston 로거를 전역 설정
  app.useLogger(WinstonModule.createLogger(winstonConfig));

  const configService = app.get(ConfigService); // .env 파일을 사용하기 위해 ConfigService 가져오기

  app.useGlobalPipes(
    // 글로벌 ValidationPipe 설정
    new ValidationPipe({
      whitelist: true, // DTO에 정의된 필드만 허용
      forbidNonWhitelisted: true, // 정의되지 않은 필드 전달 시 에러 발생
      transform: true, // 요청 데이터를 DTO 클래스 인스턴스로 자동 변환
    }),
  );

  // CORS 설정
  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL') || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    //credentials: true,
  });

  // ConfigService에서 포트 가져오기
  const port = configService.get<number>('PORT') ?? 3000;

  await app.listen(port);
  console.log(`Server is running on port ${port}`);
}
bootstrap();
