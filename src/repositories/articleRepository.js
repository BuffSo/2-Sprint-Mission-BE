import prisma from '../config/prismaClient.js';

async function save(article) {
  return prisma.article.create({
    data: article,
  });
}

async function getById(id) {
  return prisma.article.findUnique({
    where: { id },
    include: {
      articleComments: true,
    },
  });
}

async function getAll({ skip, take, where, orderBy }) {
  return prisma.article.findMany({
    where,
    orderBy,
    skip,
    take,
    include: {
      articleComments: true,
    },
  });
}

async function getCount(where) {
  return prisma.article.count({ where });
}

async function update(id, data) {
  return prisma.article.update({
    where: { id },
    data,
  });
}

async function deleteById(id) {
  return prisma.article.delete({
    where: { id },
  });
}

async function incrementFavoriteCount(transaction, articleId) {
  return transaction.article.update({
    where: { id: articleId },
    data: { favoriteCount: { increment: 1 } },
  });
}

async function decrementFavoriteCount(transaction, articleId) {
  return transaction.article.update({
    where: { id: articleId },
    data: { favoriteCount: { decrement: 1 } },
  });
}

export default {
  save,
  getById,
  getAll,
  getCount,
  update,
  deleteById,
  incrementFavoriteCount,
  decrementFavoriteCount,
}
