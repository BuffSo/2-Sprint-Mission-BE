import { Injectable, NotFoundException } from '@nestjs/common';
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
  async createComment(
    targetId: string,
    targetType: 'product' | 'article',
    createCommentDto: CreateCommentDto,
    userId: string,
  ) {
    let target;

    if (targetType === 'product') {
      target = await this.prisma.product.findUnique({
        where: { id: targetId },
      });
    } else if (targetType === 'article') {
      target = await this.prisma.article.findUnique({
        where: { id: targetId },
      });
    }

    if (!target) {
      throw new NotFoundException(
        `${targetType === 'product' ? '상품' : '게시글'}이 존재하지 않습니다.`,
      );
    }

    return this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        authorId: userId,
        [`${targetType}Id`]: targetId,
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
  async getCommentsByTargetId(
    targetId: string,
    targetType: 'product' | 'article',
    query: { cursor?: string; take?: number; orderBy?: string },
  ) {
    const { cursor, take = 10, orderBy = 'recent' } = query;

    // 정렬 방식 결정
    const orderConfig: Prisma.CommentOrderByWithRelationInput = {
      createdAt: orderBy === 'oldest' ? 'asc' : 'desc',
    };

    // 상품 또는 게시글 존재 여부 확인
    let target;

    if (targetType === 'product') {
      target = await this.prisma.product.findUnique({
        where: { id: targetId },
      });
    } else if (targetType === 'article') {
      target = await this.prisma.article.findUnique({
        where: { id: targetId },
      });
    }

    if (!target) {
      throw new NotFoundException(
        `${targetType === 'product' ? '상품' : '게시글'}을 찾을 수 없습니다.`,
      );
    }

    // 댓글 필터 조건 설정
    const where =
      targetType === 'product'
        ? { productId: targetId }
        : { articleId: targetId };

    // 댓글 목록 및 총 개수 조회
    const [comments, totalCount] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        take,
        orderBy: orderConfig,
        include: { author: true },
        ...(cursor && {
          cursor: { id: cursor },
          skip: 1,
        }),
      }),
      this.prisma.comment.count({ where }),
    ]);

    // 다음 커서 설정
    const nextCursor =
      comments.length > 0 ? comments[comments.length - 1].id : null;

    // 댓글 목록 응답 매핑
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
    return this.prisma.comment.delete({
      where: { id },
    });
  }
}
