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
    data: commentData,
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

export default {
  getAll,
  getCount,
  save,
  update,
  deleteById,
};
