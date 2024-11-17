import express from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import {
  getCommentsByProductId,
  createProductComment,
  updateProductComment,
  deleteProductComment,
} from '../services/productCommentService.js';

const router = express.Router();

// GET /products/:productId/comments
router.get('/:productId/comments', asyncHandler(async (req, res) => {
  //buff
  // console.log('req.params', req.params);
  // console.log('req.query', req.query);
  const { productId } = req.params;
  const comments = await getCommentsByProductId(productId, req.query);
  //console.log('comments', comments);
  res.send(comments);
}));

// POST /products/:productId/comments
router.post('/:productId/comments', asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const comment = await createProductComment(productId, req.body);
  res.status(201).send(comment);
}));

// PATCH /products/comments/:commentId
router.patch('/comments/:commentId', asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const updatedComment = await updateProductComment(commentId, req.body);
  res.send(updatedComment);
}));

// DELETE /products/comments/:commentId
router.delete('/comments/:commentId', asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  await deleteProductComment(commentId);
  res.sendStatus(204);
}));

export default router;
