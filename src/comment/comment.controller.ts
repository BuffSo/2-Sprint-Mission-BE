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
//import { create } from 'domain';

@Controller('products/:productId/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  //@UsePipes(new ValidationPipe({ transform: true })) <- main.ts에서 ValidationPipe를 글로벌로 설정했기 때문에 생략 가능
  async createComment(
    @Param('productId') productId: string,
    @Body() createCommentDto: CreateCommentDto,
    @currentUser('userId') userId: string,
  ) {
    const comment = await this.commentService.createProductComment(
      productId,
      createCommentDto.content,
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

  @Get()
  async getComments(
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

  @Get()
  findAll() {
    return this.commentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentService.update(+id, updateCommentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentService.remove(+id);
  }
}
