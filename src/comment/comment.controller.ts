import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { QueryCommentDto } from './dto/query-comment.dto';
import { currentUser } from 'src/auth/decorators/current-user.decorator';
import { CommentOwnerGuard } from './guards/comment-owner.gaurds';

@Controller('products')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  /*************************************************************************************
   * 댓글 생성 API
   * ***********************************************************************************
   */
  @Post(':productId/comments')
  @UseGuards(JwtAuthGuard)
  //@UsePipes(new ValidationPipe({ transform: true })) <- main.ts에서 ValidationPipe를 글로벌로 설정했기 때문에 생략 가능
  async createComment(
    @Param('productId') productId: string,
    @Body() createCommentDto: CreateCommentDto,
    @currentUser('userId') userId: string,
  ) {
    const comment = await this.commentService.createProductComment(
      productId,
      createCommentDto,
      userId,
    );
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: {
        id: comment.authorId,
        nickname: comment.author?.nickname || '익명',
        image: comment.author?.image || null,
      },
    };
  }

  /*************************************************************************************
   * 댓글 목록 조회 API
   * ***********************************************************************************
   */
  @Get(':productId/comments')
  async findAll(
    @Param('productId') productId: string,
    @Query() query: QueryCommentDto,
  ) {
    const { orderBy, cursor, limit } = query;

    return this.commentService.getCommentsByProductId(productId, {
      orderBy,
      cursor,
      take: limit,
    });
  }

  /*************************************************************************************
   * 댓글 수정 API
   * ***********************************************************************************
   */
  @Patch('comments/:id')
  @UseGuards(CommentOwnerGuard)
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentService.updateComment(id, updateCommentDto);
  }

  /*************************************************************************************
   * 댓글 삭제 API
   * ***********************************************************************************
   */
  @Delete('comments/:id')
  @UseGuards(CommentOwnerGuard)
  remove(@Param('id') id: string) {
    return this.commentService.deleteComment(id);
  }
}
