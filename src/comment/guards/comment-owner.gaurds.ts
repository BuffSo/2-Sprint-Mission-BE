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
export class CommentOwnerGuard extends JwtAuthGuard implements CanActivate {
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

    const commentId = request.params.id;
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true },
    });

    if (!comment) {
      throw new NotFoundException('요청하신 댓글을 찾을 수 없습니다.');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException(
        '본인이 작성한 댓글만 수정 또는 삭제할 수 있습니다.',
      );
    }

    return true;
  }
}
