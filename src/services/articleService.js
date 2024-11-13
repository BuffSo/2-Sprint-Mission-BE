import { assert } from 'superstruct';
import { CreateArticle, PatchArticle } from '../structs.js';
import articleRepository from '../repositories/articleRepository.js';
import { Prisma } from '@prisma/client';

export async function getArticles(query) {
  const { page = 1, pageSize = 10, orderBy = 'recent', keyword = '' } = query;
  const skip = (page - 1) * pageSize;
  const take = parseInt(pageSize, 10);

  let orderConfig;
  switch (orderBy) {
    case 'oldest':
      orderConfig = { createdAt: 'asc' };
      break;
    case 'recent':
    default:
      orderConfig = { createdAt: 'desc' };
  }

  const where = keyword
    ? {
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },    // 대소문자 구분없이 검색
          { content: { contains: keyword, mode: 'insensitive' } },
        ],
      }
    : {};

  const [articles, totalCount] = await Promise.all([
    articleRepository.getAll({ skip, take, where, orderBy: orderConfig }),
    articleRepository.getCount(where),
  ]);

  return {
    list: articles,
    totalCount,
  };
}

export async function getArticleById(id) {
  const article = await articleRepository.getById(id);
  if (!article) {
    const error = new Error('The requested resource was not found');
    error.status = 404;
    throw error;
  }
  return article;
}

export async function createArticle(data) {
  try {
    assert(data, CreateArticle);
  } catch (e) {
    e.status = 400;
    throw e;
  }
  const article = await articleRepository.save(data);
  return article;
}

export async function updateArticle(id, data) {
  try {
    assert(data, PatchArticle);
  } catch (e) {
    e.status = 400;
    throw e;
  }
  try {
    const article = await articleRepository.update(id, data);
    return article;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      const error = new Error('The requested resource was not found');
      error.status = 404;
      throw error;
    }
    throw e;
  }
}

export async function deleteArticle(id) {
  try {
    await articleRepository.deleteById(id);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      const error = new Error('The requested resource was not found');
      error.status = 404;
      throw error;
    }
    throw e;
  }
}
