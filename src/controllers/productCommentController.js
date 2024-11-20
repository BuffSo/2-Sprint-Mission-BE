import express from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import passport from '../config/passport.js';
import {
  getCommentsByProductId,
  createProductComment,
  updateProductComment,
  deleteProductComment,
} from '../services/productCommentService.js';

const productCommentController = express.Router();

// ID 변환 미들웨어
const convertIdToNumber = (req, res, next) => {
  const id = req.params.commentId || req.params.productId;
  const numericId = Number(id);

  if (!Number.isInteger(numericId)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  req.numericId = numericId;
  next();
};

// 댓글 작성 권한 확인 미들웨어
const checkCommentOwnership = async (req, res, next) => {
  //const { commentId } = req.params;
  const commentId = req.numericId;
  const userId = req.user.id;

  const comment = await getCommentsByProductId(commentId); // 댓글 정보를 가져오는 함수 (repository or service에서 구현)
  if (!comment) {
    return res.status(404).json({ message: '댓글이 존재하지 않습니다.' });
  }

  // if (comment.userId !== userId) {
  //   return res.status(403).json({ message: '본인이 작성한 댓글만 수정 또는 삭제할 수 있습니다.' });
  // }

  next();
};

// GET /products/:productId/comments
productCommentController.get('/:productId/comments', 
  convertIdToNumber,
  asyncHandler(async (req, res) => {
  const productId = req.numericId;
  const comments = await getCommentsByProductId(productId, req.query);
  res.send(comments);
}));

// POST /products/:productId/comments
productCommentController.post(
  '/:productId/comments',
  passport.authenticate('access-token', { session: false }), // 인증된 사용자만 댓글 등록 가능
  convertIdToNumber,
  asyncHandler(async (req, res) => {
    const productId = req.numericId; // convertIdToNumber가 저장한 productId
    const userId = req.user.id; // 인증된 사용자 ID
    const commentData = {
      ...req.body,
      userId,
    };
    const comment = await createProductComment(productId, commentData);
    res.status(201).send(comment);
  })
);


// PATCH /products/comments/:commentId
productCommentController.patch(
  '/comments/:commentId',
  passport.authenticate('access-token', { session: false }), // 인증된 사용자만 접근 가능
  convertIdToNumber,
  asyncHandler(checkCommentOwnership), // 댓글 작성자 확인
  asyncHandler(async (req, res) => {
    const commentId = req.numericId;
    const userId = req.user.id;
    const updatedComment = await updateProductComment(commentId, req.body, userId);
    res.send(updatedComment);
  })
);

// DELETE /products/comments/:commentId
productCommentController.delete(
  '/comments/:commentId',
  passport.authenticate('access-token', { session: false }), // 인증된 사용자만 접근 가능
  convertIdToNumber,
  asyncHandler(checkCommentOwnership), // 댓글 작성자 확인
  asyncHandler(async (req, res) => {
    const commentId = req.numericId;
    const userId = req.user.id;
    await deleteProductComment(commentId, userId);
    res.sendStatus(204);
  })
);

export default productCommentController;
