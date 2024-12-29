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
      case 'popular':
        orderConfig = { favoriteCount: 'desc' };
        break;
      case 'oldest':
        orderConfig = { createdAt: 'asc' };
        break;
      default:
        orderConfig = { createdAt: 'desc' };
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
          author: { select: { nickname: true } },
        },
      }),
      this.prisma.article.count({ where }),
    ]);

    return { list: articles, totalCount, hasMore: skip + take < totalCount };
  }

  async getArticleById(id: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!article) {
      throw new NotFoundException('Requested article not found');
    }

    return article;
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
