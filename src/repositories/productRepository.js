import prisma from '../config/prismaClient.js';

async function save(product) {
  return prisma.product.create({
    data: product,
  });
}

async function getById(id) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      productComments: true,
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

export default {
  save,
  getById,
  getAll,
  getCount,
  update,
  deleteById,
}
