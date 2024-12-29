import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FavoriteService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 좋아요 추가
   */
  async addFavorite(
    targetId: string,
    userId: string,
    type: 'article' | 'product',
  ) {
    const target = await this.findTargetById(type, targetId);

    if (!target) {
      throw new NotFoundException(
        `해당 ${type === 'product' ? '상품' : '게시글'}을 찾을 수 없습니다.`,
      );
    }

    // 이미 좋아요한 경우 예외 발생
    const existingFavorite = await this.prisma.favorite.findFirst({
      where: {
        userId,
        [`${type}Id`]: targetId,
      },
    });

    if (existingFavorite) {
      throw new BadRequestException(
        `이미 찜한 ${type === 'product' ? '상품' : '게시글'}입니다.`,
      );
    }

    // 트랜잭션으로 좋아요 추가 및 대상 좋아요 수 증가
    return this.prisma.$transaction(async (tx) => {
      await tx.favorite.create({
        data: {
          userId,
          [`${type}Id`]: targetId,
        },
      });

      const updatedTarget = await this.updateFavoriteCount(
        tx,
        type,
        targetId,
        true,
      );

      return {
        ...updatedTarget,
        isFavorite: true,
      };
    });
  }

  /**
   * 좋아요 취소
   */
  async removeFavorite(
    targetId: string,
    userId: string,
    type: 'article' | 'product',
  ) {
    const existingFavorite = await this.prisma.favorite.findFirst({
      where: {
        userId,
        [`${type}Id`]: targetId,
      },
    });

    if (!existingFavorite) {
      throw new NotFoundException(
        `찜하지 않은 ${type === 'product' ? '상품' : '게시글'}입니다.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.favorite.deleteMany({
        where: {
          userId,
          [`${type}Id`]: targetId,
        },
      });

      const updatedTarget = await this.updateFavoriteCount(
        tx,
        type,
        targetId,
        false,
      );

      return {
        ...updatedTarget,
        isFavorite: false,
      };
    });
  }

  /**
   * 대상 존재 여부 확인
   */
  private async findTargetById(type: 'article' | 'product', id: string) {
    if (type === 'product') {
      return this.prisma.product.findUnique({ where: { id } });
    } else {
      return this.prisma.article.findUnique({ where: { id } });
    }
  }

  /**
   * favoriteCount 업데이트
   */
  private async updateFavoriteCount(
    tx: any,
    type: 'article' | 'product',
    targetId: string,
    increment: boolean,
  ) {
    const updateData = increment ? { increment: 1 } : { decrement: 1 };

    if (type === 'product') {
      return tx.product.update({
        where: { id: targetId },
        data: { favoriteCount: updateData },
      });
    } else {
      return tx.article.update({
        where: { id: targetId },
        data: { favoriteCount: updateData },
      });
    }
  }
}
