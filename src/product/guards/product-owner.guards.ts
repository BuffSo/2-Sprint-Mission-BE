import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductOwnerGuard extends JwtAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // JwtAuthGuard 실행(사용자 인증)
    const isAuthenticated = (await super.canActivate(context)) as boolean;
    if (!isAuthenticated) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user.userId;

    const productId = request.params.id;

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { authorId: true },
    });

    if (!product) {
      throw new NotFoundException('요청하신 상품을 찾을 수 없습니다.');
    }

    if (product.authorId !== userId) {
      throw new ForbiddenException(
        '본인이 등록한 상품만 수정 또는 삭제할 수 있습니다.',
      );
    }

    return true;
  }
}
