import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  Delete,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { QueryArticleDto } from './dto/query-article.dto';
import { currentUser } from 'src/auth/decorators/current-user.decorator';
import { ArticleOwnerGuard } from './guards/article-owner.guards';
import { ConfigService } from '@nestjs/config';

@Controller('articles')
export class ArticleController {
  constructor(
    private readonly articleService: ArticleService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createArticleDto: CreateArticleDto,
    @currentUser('userId') userId: string,
  ) {
    return this.articleService.createArticle(createArticleDto, userId);
  }

  @Get()
  async findAll(@Query() query: QueryArticleDto) {
    return this.articleService.getArticles(query);
  }
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getArticle(
    @Param('id') articleId: string,
    @currentUser('userId') userId: string,
  ) {
    return this.articleService.getArticleById(articleId, userId);
  }

  @Patch(':id')
  @UseGuards(ArticleOwnerGuard)
  async update(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.articleService.updateArticle(id, updateArticleDto);
  }

  @Delete(':id')
  @UseGuards(ArticleOwnerGuard)
  async remove(@Param('id') id: string) {
    return this.articleService.deleteArticle(id);
  }
}
