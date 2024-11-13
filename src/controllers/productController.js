import express from 'express';
import asyncHandler from '../middlewares/asyncHandler.js';
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
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await getProductById(id);
    res.send(product);
  }
));

productController.post('/', 
  asyncHandler(async (req, res) => {
    const product = await createProduct(req.body);
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