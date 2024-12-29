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

/**
 * 상품 및 게시글 댓글 컨트롤러
 * @Controller('/:type') - 상품(products) 또는 게시글(articles)을 동적으로 처리
 */
@Controller('/:type')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  /*************************************************************************************
   * 댓글 생성 API (상품 및 게시글)
   * ***********************************************************************************
   */
  @Post(':targetId/comments')
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Param('targetId') targetId: string,
    @Param('type') type: 'products' | 'articles',
    @Body() createCommentDto: CreateCommentDto,
    @currentUser('userId') userId: string,
  ) {
    const targetType = type === 'products' ? 'product' : 'article';
    const comment = await this.commentService.createComment(
      targetId,
      targetType,
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
   * 댓글 목록 조회 API (상품 및 게시글)
   * ***********************************************************************************
   */
  @Get(':targetId/comments')
  async findAll(
    @Param('targetId') targetId: string,
    @Param('type') type: 'products' | 'articles',
    @Query() query: QueryCommentDto,
  ) {
    const targetType = type === 'products' ? 'product' : 'article';
    const { orderBy, cursor, limit } = query;

    return this.commentService.getCommentsByTargetId(targetId, targetType, {
      orderBy,
      cursor,
      take: limit,
    });
  }

  /*************************************************************************************
   * 댓글 수정 API (공통)
   * ***********************************************************************************
   */
  @Patch('comments/:id')
  @UseGuards(CommentOwnerGuard)
  async updateComment(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.updateComment(id, updateCommentDto);
  }

  /*************************************************************************************
   * 댓글 삭제 API (공통)
   * ***********************************************************************************
   */
  @Delete('comments/:id')
  @UseGuards(CommentOwnerGuard)
  async removeComment(@Param('id') id: string) {
    return this.commentService.deleteComment(id);
  }
}
