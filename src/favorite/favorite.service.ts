import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FavoriteService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 상품 좋아요 추가
   */
  async addFavorite(productId: string, userId: string) {
    // 상품 존재 여부 확인
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('해당 상품을 찾을 수 없습니다.');
    }

    // 이미 좋아요한 상품인지 확인
    const existingFavorite = await this.prisma.favorite.findFirst({
      where: { productId, userId },
    });

    if (existingFavorite) {
      throw new Error('이미 찜한 상품입니다.');
    }

    // 트랜잭션으로 좋아요 추가 및 상품 좋아요 수 증가
    return await this.prisma.$transaction(async (tx) => {
      await tx.favorite.create({
        data: {
          userId,
          productId,
        },
      });

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          favoriteCount: { increment: 1 }, // favoriteCount 증가
        },
      });

      return {
        ...updatedProduct,
        isFavorite: true,
      };
    });
  }

  /**
   * 상품 좋아요 취소
   */
  async removeFavorite(productId: string, userId: string) {
    const existingFavorite = await this.prisma.favorite.findFirst({
      where: { productId, userId },
    });

    if (!existingFavorite) {
      throw new Error('찜하지 않은 상품입니다.');
    }

    return await this.prisma.$transaction(async (tx) => {
      await tx.favorite.deleteMany({
        where: { userId, productId },
      });

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          favoriteCount: { decrement: 1 }, // favoriteCount 감소
        },
      });

      return {
        ...updatedProduct,
        isFavorite: false,
      };
    });
  }
}
