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
export class ArticleOwnerGuard extends JwtAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAuthenticated = (await super.canActivate(context)) as boolean;
    if (!isAuthenticated) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user.userId;

    const articleId = request.params.id;

    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      select: { authorId: true },
    });

    if (!article) {
      throw new NotFoundException('요청하신 글을 찾을 수 없습니다.');
    }

    if (article.authorId !== userId) {
      throw new ForbiddenException(
        '본인이 작성한 글만 수정 또는 삭제할 수 있습니다.',
      );
    }

    return true;
  }
}
