import { Controller, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { currentUser } from 'src/auth/decorators/current-user.decorator';

@Controller()
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  /**
   * 게시글 좋아요 추가
   */
  @Post('articles/:id/favorite')
  @UseGuards(JwtAuthGuard)
  async addArticleFavorite(
    @Param('id') articleId: string,
    @currentUser('userId') userId: string,
  ) {
    return this.favoriteService.addFavorite(articleId, userId, 'article');
  }

  /**
   * 게시글 좋아요 취소
   */
  @Delete('articles/:id/favorite')
  @UseGuards(JwtAuthGuard)
  async removeArticleFavorite(
    @Param('id') articleId: string,
    @currentUser('userId') userId: string,
  ) {
    return this.favoriteService.removeFavorite(articleId, userId, 'article');
  }

  /**
   * 상품 좋아요 추가
   */
  @Post('products/:id/favorite')
  @UseGuards(JwtAuthGuard)
  async addProductFavorite(
    @Param('id') productId: string,
    @currentUser('userId') userId: string,
  ) {
    return this.favoriteService.addFavorite(productId, userId, 'product');
  }

  /**
   * 상품 좋아요 취소
   */
  @Delete('products/:id/favorite')
  @UseGuards(JwtAuthGuard)
  async removeProductFavorite(
    @Param('id') productId: string,
    @currentUser('userId') userId: string,
  ) {
    return this.favoriteService.removeFavorite(productId, userId, 'product');
  }
}
