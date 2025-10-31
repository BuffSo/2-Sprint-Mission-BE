import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';

@Global() // 전역 모듈로 설정하여 모든 곳에서 사용 가능
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
