import express from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import passport from '../config/passport.js';
import { 
  createProduct, 
  deleteProduct, 
  getProcuts, 
  getProductById, 
  updateProduct 
} from '../services/productService.js';

const productController = express.Router();

productController.get('/', 
  asyncHandler(async (req, res) => {
    const result = await getProcuts(req.query);
    res.send(result);
  }
));

productController.get('/:id', 
  //passport.authenticate('access-token', { session: false }),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const numericId = parseInt(id, 10);

    // ID가 유효하지 않으면 400 Bad Request 반환
    if (isNaN(numericId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    try {
      // 인증된 사용자 ID 가져오기
      const userId = req.user?.id || null;
      const product = await getProductById(numericId, userId);

      // 로그인하지 않은 경우 isFavorite을 false로 설정
      if (!userId) {
        product.isFavorite = false;
      }

      res.status(200).json(product);
    } catch (error) {
      if (error.status === 404) {
        return res.status(404).json({ message: error.message });
      }
      throw error;
    }
  })
);

productController.post('/', 
  passport.authenticate('access-token', { session: false }), // 사용자 인증 추가
  asyncHandler(async (req, res) => {
    console.log('req', req.body);

    const { id: userId } = req.user; // 인증된 사용자 ID 가저오기

    const product = await createProduct({
      ...req.body,
      authorId: userId
    });
    res.status(201).send(product);
  }
));

productController.patch('/:id', 
  asyncHandler( async(req, res) => {
    const { id } = req.params;
    const product = await updateProduct(id, req.body);
    res.send(product);
  }
));

productController.delete('/:id', 
  asyncHandler( async(req, res) => {
    const { id } = req.params;
    await deleteProduct(id);
    res.sendStatus(204);
  }
));

export default productController;