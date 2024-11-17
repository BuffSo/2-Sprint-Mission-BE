import { assert } from 'superstruct';
import { CreateProductComment, PatchProductComment } from '../structs.js';
import productCommentRepository from '../repositories/productCommentRepository.js';

export const getCommentsByProductId = async (productId, query) => {
  const { cursor, take = 10, orderBy = 'recent' } = query;

  let orderConfig;
  switch (orderBy) {
    case 'oldest':
      orderConfig = { createdAt: 'asc' };
      break;
    case 'recent':
    default:
      orderConfig = { createdAt: 'desc' };
  }

  const queryOptions = {
    where: { productId: parseInt(productId, 10) },
    take: parseInt(take, 10),
    orderBy: orderConfig,
    ...(cursor && {
      cursor: { id: parseInt(cursor, 10) },
      skip: 1,
    }),
  };

  const [comments, totalCount] = await Promise.all([
    productCommentRepository.getAll(queryOptions),
    productCommentRepository.getCount({ productId: parseInt(productId, 10) }),
  ])
  return {
    list: comments,
    totalCount
  };
};

export const createProductComment = async (productId, data) => {
  assert(data, CreateProductComment);

  const { content } = data;
  if (!content) {
    const error = new Error('Content is required');
    error.status = 400;
    throw error;
  }

  return productCommentRepository.save({
    content,
    productId: parseInt(productId, 10),
  });
};

export const updateProductComment = async (commentId, data) => {
  assert(data, PatchProductComment);

  return productCommentRepository.update(parseInt(commentId, 10), data);
};

export const deleteProductComment = async (commentId) => {
  return productCommentRepository.deleteById(parseInt(commentId, 10));
};
