import prisma from '../config/prismaClient.js';

async function getAll({ where, take, orderBy, cursor, skip }) {
  return prisma.productComment.findMany({
    where,
    take,
    orderBy,
    ...(cursor ? { cursor, skip } : {}),
  });
}

async function getCount(where) {
  return prisma.productComment.count({ where });
}

async function save(commentData) {
  return prisma.productComment.create({
    data: {
      content: commentData.content,
      productId: commentData.productId,
      authorId: commentData.authorId, // authorId 추가
    },
  });
}

async function update(commentId, data) {
  return prisma.productComment.update({
    where: { id: commentId },
    data,
  });
}

async function deleteById(commentId) {
  return prisma.productComment.delete({
    where: { id: commentId },
  });
}

async function getById(commentId) {
  return prisma.productComment.findUnique({
    where: { id: commentId },
    include: {
      author: true, // 작성자 정보를 함께 가져옵니다.
    },
  });
}

export default {
  getAll,
  getCount,
  save,
  update,
  deleteById,
  getById,
};
