import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // PrismaModule을 전역 모듈로 선언, 다른 모듈에서 import 없이 PrismaService를 사용할 수 있음
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
