import express from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
} from '../services/articleService.js';

const articleController = express.Router();

articleController.get( '/',
  asyncHandler(async (req, res, next) => {
    const result = await getArticles(req.query);
    res.send(result);
  })
);

articleController.get( '/:id',
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const article = await getArticleById(id);
    res.send(article);
  })
);

articleController.post( '/',
  asyncHandler(async (req, res, next) => {
    const article = await createArticle(req.body);
    res.status(201).send(article);
  })
);

articleController.patch( '/:id',
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const article = await updateArticle(id, req.body);
    res.send(article);
  })
);

articleController.delete( '/:id',
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    await deleteArticle(id);
    res.sendStatus(204);
  })
);

export default articleController;