import prisma from '../config/prismaClient.js';

async function save(product) {
  const { authorId, ...rest } = product;  // authorId를 분리하여 관계로 설정
  return prisma.product.create({
    data: {
      ...rest,
      author: { 
        connect : { id: product.authorId }  // author 관계 설정
      },
    },
  });
}

async function isProductFavoritedByUser(productId, userId) {
  const favorite = await prisma.favorite.findFirst({
    where: {
      productId,
      userId,
    },
  });
  return !!favorite; // favorite 값이 truthy인지 확인하고 명시적으로 boolean으로 변환
}

async function getById(id) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      productComments: true,
      author: true,
    },
  });
}

async function getAll({ skip, take, where, orderBy }) {
  return prisma.product.findMany({
    where,
    orderBy,
    skip,
    take,
    include: {
      productComments: true,
      author: true,
    },
  });
}

async function getCount(where) {
  return prisma.product.count({ where });
}

async function update(id, data) {
  return prisma.product.update({
    where: { id },
    data,
  });
}

async function deleteById(id) {
  return prisma.product.delete({
    where: { id },
  });
}

async function incrementFavoriteCount(transaction, productId) {
  return transaction.product.update({
    where: { id: productId },
    data: { favoriteCount: { increment: 1 } },
  });
}

async function decrementFavoriteCount(transaction, productId) {
  return transaction.product.update({
    where: { id: productId },
    data: { favoriteCount: { decrement: 1 } },
  })
}

export default {
  save,
  getById,
  getAll,
  getCount,
  update,
  deleteById,
  isProductFavoritedByUser,
  incrementFavoriteCount,
  decrementFavoriteCount,
}
