import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ArticleService {
  constructor(private readonly prisma: PrismaService) {}

  async createArticle(createArticleDto: CreateArticleDto, userId: string) {
    const { title, content } = createArticleDto;

    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      throw new BadRequestException(`User with id ${userId} does not exist`);
    }

    return this.prisma.article.create({
      data: {
        title,
        content,
        author: {
          connect: { id: userId },
        },
      },
    });
  }

  /***************************************************************************
   * 게시글 목록 조회
   * *************************************************************************
   */
  async getArticles(query: {
    page?: number;
    pageSize?: number;
    orderBy?: string;
    keyword?: string;
  }) {
    const { page = 1, pageSize = 10, orderBy = 'recent', keyword = '' } = query;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    let orderConfig: Prisma.ArticleOrderByWithRelationInput;
    switch (orderBy) {
      case 'favorite':
        orderConfig = { favoriteCount: 'desc' };
        break;
      case 'oldest':
        orderConfig = { createdAt: 'asc' };
        break;
      case 'recent':
      default:
        orderConfig = { createdAt: 'desc' };
        break;
    }

    const where: Prisma.ArticleWhereInput = keyword
      ? {
          OR: [
            { title: { contains: keyword, mode: 'insensitive' } },
            { content: { contains: keyword, mode: 'insensitive' } },
          ],
        }
      : {};

    const [articles, totalCount] = await Promise.all([
      this.prisma.article.findMany({
        where,
        skip,
        take,
        orderBy: orderConfig,
        include: {
          author: {
            select: {
              id: true,
              email: true,
              nickname: true,
            },
          },
        },
      }),
      this.prisma.article.count({ where }),
    ]);

    return { list: articles, totalCount, hasMore: skip + take < totalCount };
  }

  /***************************************************************************
   * 게시글 상세 조회
   * *************************************************************************
   */
  async getArticleById(articleId: string, userId: string) {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      include: { author: true }, // 작성자 정보 포함
    });

    if (!article) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    // 좋아요 여부 확인
    const userFavorite = !!(await this.prisma.favorite.findFirst({
      where: {
        userId,
        articleId,
      },
    }));

    // 게시글 데이터 반환
    return {
      id: article.id,
      title: article.title,
      content: article.content,
      ownerId: article.author.id,
      ownerNickname: article.author.nickname,
      createdAt: article.createdAt,
      favoriteCount: article.favoriteCount,
      isFavorite: userFavorite,
    };
  }

  async updateArticle(id: string, updateArticleDto: UpdateArticleDto) {
    const existingArticle = await this.prisma.article.findUnique({
      where: { id },
    });

    if (!existingArticle) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }

    return this.prisma.article.update({
      where: { id },
      data: updateArticleDto,
    });
  }

  async deleteArticle(id: string) {
    return this.prisma.article.delete({
      where: { id },
    });
  }
}
