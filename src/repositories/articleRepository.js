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

export default {
  save,
  getById,
  getAll,
  getCount,
  update,
  deleteById,
}
