import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Category, Prisma } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  /***************************************************************************
   * 상품 등록
   * *************************************************************************
   */
  async createProduct(createProductDto: CreateProductDto, userId: string) {
    const { name, description, price, images, tags } = createProductDto;

    // 유저 검증
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      throw new BadRequestException(`User with id ${userId} does not exist`);
    }

    return await this.prisma.product.create({
      data: {
        name,
        description,
        price,
        images,
        tags,
        author: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  /***************************************************************************
   * 상품 목록 조회
   * *************************************************************************
   */
  async getProducts(query: {
    page?: number;
    pageSize?: number;
    orderBy?: string;
    keyword?: string;
    category?: string;
  }) {
    const {
      page = 1,
      pageSize = 10,
      orderBy = 'recent',
      keyword = '',
      category = '',
    } = query;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    let orderConfig: Prisma.ProductOrderByWithRelationInput;
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

    const where: Prisma.ProductWhereInput = {};
    if (keyword) {
      where.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }
    if (category) {
      if (Object.values(Category).includes(category as Category)) {
        where.category = category as Category;
      } else {
        throw new BadRequestException(`Invalid category: ${category}`);
      }
    }

    const [products, totalCount] = await Promise.all([
      this.prisma.product.findMany({
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
      this.prisma.product.count({ where }),
    ]);

    return {
      list: products,
      totalCount,
      hasMore: skip + take < totalCount,
    };
  }

  async findAll() {
    return this.prisma.product.findMany();
  }

  /***************************************************************************
   * 상품 상세 조회
   * *************************************************************************
   */
  async getProductById(id: string, userId?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            nickname: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('요청하신 상품을 찾을 수 없습니다.');
    }

    // 사용자 인증된 경우 좋아요 여부 확인
    let isFavorite = false;
    if (userId) {
      const favorite = await this.prisma.favorite.findFirst({
        where: {
          productId: id,
          userId,
        },
      });
      isFavorite = !!favorite;
    }
    // 요청된 응답 형식에 맞게 가공하여 반환
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      tags: product.tags,
      images: product.images,
      favoriteCount: product.favoriteCount,
      createdAt: product.createdAt,
      ownerNickname: product.author?.nickname || null,
      ownerId: product.author?.id || null,
      isFavorite,
    };
  }

  /***************************************************************************
   * 상품 수정
   * *************************************************************************
   */
  async updateProduct(id: string, updateProductDto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  /***************************************************************************
   * 상품 삭제
   * *************************************************************************
   */
  async deleteProduct(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
