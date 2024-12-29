// src/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Logger } from 'winston';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject('PURE_WINSTON_LOGGER')
    private readonly logger: Logger, // 순수 Winston Logger
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // HTTP 요청 객체
    const req = context.switchToHttp().getRequest();
    const { method, url, body, query, params } = req;

    // 요청 시간 측정
    const now = Date.now();

    return next.handle().pipe(
      tap({
        // 정상(성공) 처리 시 로그
        // next: () => {
        //   const ms = Date.now() - now;
        //   this.logger.info(
        //     `[${method}] ${url} (${ms}ms)\n` +
        //       `body: ${JSON.stringify(body)}\n` +
        //       `query: ${JSON.stringify(query)}\n` +
        //       `params: ${JSON.stringify(params)}\n`,
        //   );
        // },

        // 에러(실패) 발생 시 로그
        error: (err) => {
          const ms = Date.now() - now;
          this.logger.error(
            `[${method}] ${url} (${ms}ms) - Error: ${err.message}\n` +
              `body: ${JSON.stringify(body)}\n` +
              `query: ${JSON.stringify(query)}\n` +
              `params: ${JSON.stringify(params)}\n`,
          );
        },
      }),
    );
  }
}
