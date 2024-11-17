import { assert } from 'superstruct';
import { CreateProductComment, PatchProductComment } from '../structs.js';
import productCommentRepository from '../repositories/productCommentRepository.js';

export const getCommentsByProductId = async (productId, query = {}) => {
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
  ]);

  // 마지막 댓글 ID를 다음 커서로 설정
  const nextCursor = comments.length > 0 ? comments[comments.length - 1].id : null;

  // 요청한 응답 형식으로 데이터 매핑
  const formattedComments = comments.map((comment) => ({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    writer: {
      id: comment.writer?.id || null,
      nickname: comment.writer?.nickname || '익명',
      image: comment.writer?.image || null,
    },
  }));

  return {
    nextCursor,
    list: formattedComments,
    totalCount,
  };
};

export const createProductComment = async (productId, data) => {
  assert(data, CreateProductComment);

  const { content, userId } = data;
  if (!content) {
    const error = new Error('Content is required');
    error.status = 400;
    throw error;
  }

  return productCommentRepository.save({
    content,
    productId: parseInt(productId, 10),
    authorId: userId, // 사용자 ID를 저장
  });
};

export const updateProductComment = async (commentId, data, userId) => {
  const comment = await productCommentRepository.getById(commentId);

  if (!comment) {
    const error = new Error('Comment not found');
    error.status = 404;
    throw error;
  }

  if (comment.authorId !== userId) {
    const error = new Error('You do not have permission to update this comment');
    error.status = 403;
    throw error;
  }

  return productCommentRepository.update(commentId, data);
};

export const deleteProductComment = async (commentId, userId) => {
  const comment = await productCommentRepository.getById(commentId);

  if (!comment) {
    const error = new Error('Comment not found');
    error.status = 404;
    throw error;
  }

  if (comment.authorId !== userId) {
    const error = new Error('본인이 작성한 문의 글만 삭제하실 수 있습니다.');
    error.status = 403;
    throw error;
  }

  return productCommentRepository.deleteById(commentId);
};
