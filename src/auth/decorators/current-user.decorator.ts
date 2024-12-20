import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const currentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    // data가 주어지면 user[data]를 반환하고, 없으면 user 객체 전체를 반환.
    // 예: @CurrentUser('userId') -> user.userId 반환
    return data ? user?.[data] : user;
  },
);
