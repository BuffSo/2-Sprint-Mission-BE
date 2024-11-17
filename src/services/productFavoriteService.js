import prisma from '../config/prismaClient.js';

export async function addFavorite(productId, userId) {
  const existingFavorite = await prisma.favorite.findFirst({
    where: { productId, userId },
  });

  if (existingFavorite) {
    const error = new Error('이미 찜한 상품입니다.');
    error.status = 400;
    throw error;
  }

  return await prisma.$transaction(async (tx) => {
    await tx.favorite.create({ data: { userId, productId } });
    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: { favoriteCount: { increment: 1 } },
    });

    return {
      ...updatedProduct,
      isFavorite: true,
    };
  });
}

export async function removeFavorite(productId, userId) {
  const existingFavorite = await prisma.favorite.findFirst({
    where: { productId, userId },
  });

  if (!existingFavorite) {
    const error = new Error('찜하지 않은 상품입니다.');
    error.status = 400;
    throw error;
  }

  return await prisma.$transaction(async (tx) => {
    await tx.favorite.deleteMany({ where: { userId, productId } });
    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: { favoriteCount: { decrement: 1 } },
    });

    return {
      ...updatedProduct,
      isFavorite: false,
    };
  });
}
