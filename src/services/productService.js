import { assert } from 'superstruct';
import { CreatePoduct, PatchProduct } from '../structs.js';
import productRepository from '../repositories/productRepository.js';
import { Prisma } from '@prisma/client';

export const getProcuts = async (query) => {
  const { page = 1, pageSize = 10, orderBy = 'recent', keyword = '', category ='' } = query;

  const skip = (page -1) * pageSize; //offset
  const take = parseInt(pageSize);

  let orderConfig;
  switch (orderBy) {
    case 'oldest' :
      orderConfig = { createdAt : 'asc' };
      break;
    case 'recent' :
    default : 
      orderConfig = { createdAt : 'desc' };
  }

  const where = {
    AND: [
      keyword ? {
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },   // 대소문자 구분 없이 검색
          { description: { contains: keyword, mode: 'insensitive' } } 
        ]
      } : {},
      category ? { category: category } : {}
    ]
  };

  const [products, totalCount] = await Promise.all([
    productRepository.getAll({ skip, take, where, orderBy: orderConfig }),
    productRepository.getCount(where),
  ]);

  return {
    list: products,
    totalCount,
  };
};

export const getProductById = async (id) => {
  const product = await productRepository.getById(id);
  if (!product) {
    const error = new Error('요청하신 상품이 존재하지 않습니다.');
    error.status = 404;
    throw error;
  }
  return product
};

export const createProduct = async(data) => {
  try {
    assert(data, CreatePoduct);
  } catch (e) {
    e.status = 400;
    throw e;
  }
  const product = await productRepository.save(data);
  return product;
}

export async function updateProduct(id, data) {
  try {
    assert(data, PatchProduct);
  } catch (e) {
    e.status = 400;
    throw e;
  }
  try {
    const product = await productRepository.update(id, data);
    return product;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      const error = new Error('The requested resource was not found');
      error.status = 404;
      throw error;
    }
    throw e;
  }
}

export async function deleteProduct(id) {
  try {
    await productRepository.deleteById(id);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      const error = new Error('The requested resource was not found');
      error.status = 404;
      throw error;
    }
    throw e;
  }
}