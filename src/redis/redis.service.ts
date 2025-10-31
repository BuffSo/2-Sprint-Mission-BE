import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;

  constructor() {
    // REDIS_URL 우선 사용 (Upstash, Render Redis 등 클라우드 환경)
    if (process.env.REDIS_URL) {
      const redisUrl = new URL(process.env.REDIS_URL);
      this.client = new Redis({
        host: redisUrl.hostname,
        port: parseInt(redisUrl.port) || 6379,
        password: redisUrl.password || undefined,
        username: redisUrl.username || undefined,
        // rediss:// (TLS) 프로토콜 지원
        tls: redisUrl.protocol === 'rediss:' ? {} : undefined,
        maxRetriesPerRequest: 3,
      });
    } else {
      // 개별 환경변수 사용 (로컬 개발 환경)
      this.client = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
      });
    }

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('Redis Client Connected');
    });
  }

  /**
   * 인증 코드 저장 (10분 TTL)
   * @param email 이메일
   * @param type 인증 타입 (password-setup | password-reset)
   * @param code 6자리 인증 코드
   */
  async setVerificationCode(
    email: string,
    type: 'password-setup' | 'password-reset',
    code: string,
  ): Promise<void> {
    const key = `verification:${email}:${type}`;
    // 10분(600초) TTL
    await this.client.setex(key, 600, code);
  }

  /**
   * 인증 코드 조회
   * @param email 이메일
   * @param type 인증 타입
   * @returns 인증 코드 또는 null
   */
  async getVerificationCode(
    email: string,
    type: 'password-setup' | 'password-reset',
  ): Promise<string | null> {
    const key = `verification:${email}:${type}`;
    return await this.client.get(key);
  }

  /**
   * 인증 코드 검증 및 삭제
   * @param email 이메일
   * @param type 인증 타입
   * @param code 사용자가 입력한 코드
   * @returns 인증 성공 여부
   */
  async verifyAndDeleteCode(
    email: string,
    type: 'password-setup' | 'password-reset',
    code: string,
  ): Promise<boolean> {
    const savedCode = await this.getVerificationCode(email, type);

    if (!savedCode || savedCode !== code) {
      return false;
    }

    // 인증 성공 시 코드 삭제
    const key = `verification:${email}:${type}`;
    await this.client.del(key);

    return true;
  }

  /**
   * 인증 코드 삭제 (취소 시)
   * @param email 이메일
   * @param type 인증 타입
   */
  async deleteVerificationCode(
    email: string,
    type: 'password-setup' | 'password-reset',
  ): Promise<void> {
    const key = `verification:${email}:${type}`;
    await this.client.del(key);
  }

  /**
   * 일반 key-value 저장
   * @param key 키
   * @param value 값
   * @param ttl TTL(초) - 선택사항
   */
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setex(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  /**
   * 일반 key-value 조회
   * @param key 키
   * @returns 값 또는 null
   */
  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  /**
   * 키 삭제
   * @param key 키
   */
  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  /**
   * 모듈 종료 시 Redis 연결 종료
   */
  async onModuleDestroy() {
    await this.client.quit();
  }
}
