import express from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import { 
  createProductComment, 
  deleteProductComment, 
  getCommentsByProductId, 
  updateProductComment
} from '../services/productCommentService.js';

const router = express.Router();
// /products
router.get('/:productId/comments', asyncHandler(getCommentsByProductId));
router.post('/:productId/comments', asyncHandler(createProductComment));
router.patch('/comments/:commentId', asyncHandler(updateProductComment));
router.delete('/comments/:commentId', asyncHandler(deleteProductComment));
export default router;

