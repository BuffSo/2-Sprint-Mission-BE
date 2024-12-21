import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  /*************************************************************************************
   * 댓글 생성
   * ***********************************************************************************
   */
  async createProductComment(
    productId: string,
    createCommentDto: CreateCommentDto,
    userId: string,
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(
        '댓글을 작성하려는 상품이 존재하지 않습니다.',
      );
    }

    return this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        authorId: userId,
        productId,
      },
      include: {
        author: true,
      },
    });
  }

  /*************************************************************************************
   * 댓글 목록 조회
   * ***********************************************************************************
   */
  async getCommentsByProductId(
    productId: string,
    query: { cursor?: string; take?: number; orderBy?: string },
  ) {
    const { cursor, take = 10, orderBy = 'recent' } = query;

    // 정렬 방식 결정
    let orderConfig: Prisma.CommentOrderByWithRelationInput;
    switch (orderBy) {
      case 'oldest':
        orderConfig = { createdAt: 'asc' };
        break;
      case 'recent':
      default:
        orderConfig = { createdAt: 'desc' };
    }

    // 상품 존재 여부 체크
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const [comments, totalCount] = await Promise.all([
      this.prisma.comment.findMany({
        where: { productId },
        take,
        orderBy: orderConfig,
        include: {
          author: true,
        },
        ...(cursor && {
          cursor: { id: cursor },
          skip: 1,
        }),
      }),
      this.prisma.comment.count({ where: { productId } }),
    ]);

    // 다음 커서 설정
    const nextCursor =
      comments.length > 0 ? comments[comments.length - 1].id : null;

    // 응답 형식 매핑
    const formattedComments = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      writer: {
        id: comment.author?.id || null,
        nickname: comment.author?.nickname || '익명',
        image: comment.author?.image || null,
      },
    }));

    return {
      nextCursor,
      list: formattedComments,
      totalCount,
    };
  }

  /*************************************************************************************
   * 댓글 수정
   * ***********************************************************************************
   */
  async updateComment(id: string, updateCommentDto: UpdateCommentDto) {
    return this.prisma.comment.update({
      where: { id },
      data: updateCommentDto,
    });
  }

  /*************************************************************************************
   * 댓글 삭제
   * ***********************************************************************************
   */
  async deleteComment(id: string) {
    return this.prisma.comment.delete({ where: { id } });
  }
}
