import express from 'express';
const router = express.Router();
import {
  getProducts,
  getCategory,
  getProductById,
  getProductByUserId,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import checkObjectId from '../middleware/checkObjectId.js';
import Product from '../models/productModel.js';
import advancedResults from '../middleware/advancedResults.js';

router
  .route('/')
  .get(advancedResults(Product, 'user'), getProducts)
  .post(protect, createProduct);
router.route('/category').get(getCategory);
router.route('/user').get(protect, getProductByUserId);
router.route('/:id/reviews').post(protect, checkObjectId, createProductReview);
router.get('/top', getTopProducts);
router
  .route('/:id')
  .get(checkObjectId, getProductById)
  // .put(updateProduct)
  .put(protect, checkObjectId, updateProduct)
  .delete(protect, admin, checkObjectId, deleteProduct);

export default router;
