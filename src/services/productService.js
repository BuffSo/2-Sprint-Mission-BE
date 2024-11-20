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
    case 'favorite':
      orderConfig = { favoriteCount: 'desc' };
      break;    
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

  // console.log('products', products);

  // 요청한 응답 형식으로 데이터 매핑
  const formattedProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    tags: product.tags,
    images: product.images,
    favoriteCount: product.favoriteCount,
    createdAt: product.createdAt,
    ownerNickname: product.author?.nickname || null, // author 정보에서 nickname 가져오기
    ownerId: product.author?.id || null, // author 정보에서 id 가져오기
  }));

  return {
    list: formattedProducts,
    totalCount,
  };
};

export const getProductById = async (id, userId = null) => {
  // 상품 상세 정보 조회
  const product = await productRepository.getById(id);
  if (!product) {
    const error = new Error('요청하신 상품이 존재하지 않습니다.');
    error.status = 404;
    throw error;
  }

  let isFavorite = false;
  // 사용자 인증된 경우 좋아요 여부 확인
  if (userId) {
    isFavorite = await productRepository.isProductFavoritedByUser(id, userId);
    //console.log('isFavorite', isFavorite);
  }
  // 요청된 응답 형식에 맞게 가공
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
};

export const createProduct = async(data) => {
  try {
    assert(data, CreatePoduct);
  } catch (e) {
    const validationError = new Error(`Invalid input: ${e.message}`);
    validationError.status = 400;
    console.error(`Validation error: ${validationError.message}`);
    throw validationError;
  }

  const product = await productRepository.save(data); // authorId 포함되어 전달
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

