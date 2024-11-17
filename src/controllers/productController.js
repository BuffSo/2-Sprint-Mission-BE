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
import productRepository from '../repositories/productRepository.js';

const productController = express.Router();

const actionMapping = {
  PATCH: '수정',
  DELETE: '삭제',
  GET: '조회',
};

// ID 변환 미들웨어
const convertIdToNumber = (req, res, next) => {
  const numericId = Number(req.params.id);

  if (!Number.isInteger(numericId)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  req.numericId = numericId;
  next();
};

// 권한 확인 미들웨어
const checkProductOwnership = async (req, res, next) => {
  const id = req.numericId; // 변환된 ID
  const userId = req.user.id; // 인증된 사용자 ID

  // 상품 정보 가져오기
  const product = await productRepository.getById(id);

  if (!product) {
    return res.status(404).json({ message: '요청하신 ID에 대한 상품이 없습니다.' });
  }

  if (product.authorId !== userId) {
    const action = actionMapping[req.method] || '작업'; // 매핑되지 않은 메서드는 기본값 "작업" 사용
    return res.status(403).json({ message: `자신이 등록한 상품만 ${action}하실 수 있습니다.` });
  }

  next(); // 권한 확인 성공 시 다음 미들웨어로 이동
};

productController.get('/', 
  asyncHandler(async (req, res) => {
    const result = await getProcuts(req.query);
    res.send(result);
  }
));

productController.get('/:id', 
  //passport.authenticate('access-token', { session: false }),
  convertIdToNumber,
  asyncHandler(async (req, res) => {
    const id = req.numericId; 
    try {
      // 인증된 사용자 ID 가져오기
      const userId = req.user?.id || null;
      const product = await getProductById(id, userId);

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
    //console.log('req', req.body);

    const { id: userId } = req.user; // 인증된 사용자 ID 가저오기

    const product = await createProduct({
      ...req.body,
      authorId: userId
    });
    res.status(201).send(product);
  }
));

productController.patch('/:id', 
  passport.authenticate('access-token', { session: false }),
  convertIdToNumber,
  asyncHandler(checkProductOwnership), // 권한 확인 미들웨어
  asyncHandler(async (req, res) => {
    const id = req.numericId; 
    const updatedProduct = await updateProduct(id, req.body); // 이미 권한 확인됨
    res.status(200).json(updatedProduct); // 수정된 상품 반환
  })
);


productController.delete('/:id', 
  passport.authenticate('access-token', { session: false }),
  convertIdToNumber,
  asyncHandler(checkProductOwnership), // 권한 확인 미들웨어
  asyncHandler( async(req, res) => {
    const id = req.numericId; 
    await deleteProduct(id);
    res.sendStatus(204);
  }
));

export default productController;