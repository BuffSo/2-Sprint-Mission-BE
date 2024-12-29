import { Controller, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { currentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('products')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  /**
   * 상품 좋아요 추가
   */
  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  async addFavorite(
    @Param('id') productId: string,
    @currentUser('userId') userId: string,
  ) {
    return this.favoriteService.addFavorite(productId, userId);
  }

  /**
   * 상품 좋아요 취소
   */
  @Delete(':id/favorite')
  @UseGuards(JwtAuthGuard)
  async removeFavorite(
    @Param('id') productId: string,
    @currentUser('userId') userId: string,
  ) {
    return this.favoriteService.removeFavorite(productId, userId);
  }
}
