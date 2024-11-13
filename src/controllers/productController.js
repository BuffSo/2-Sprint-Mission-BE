import express from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
import { 
  createProduct, 
  deletProduct, 
  getProcuts, 
  getProductById, 
  updateProduct 
} from '../services/productService.js';

const productController = express.Router();
// /products
productController.get('/', asyncHandler(getProcuts));
productController.get('/:id', asyncHandler(getProductById));
productController.post('/', asyncHandler(createProduct));
productController.patch('/:id', asyncHandler(updateProduct));
productController.delete('/:id', asyncHandler(deletProduct));

export default productController;