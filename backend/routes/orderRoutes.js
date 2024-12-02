import express from 'express';
const router = express.Router();
import {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToPaidMobile,
  wxGZHPayment,
  updateOrderToDelivered,
  getOrders,
  updateOrderPayMethod,
  updateRoulette,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/mine').get(protect, getMyOrders);
router.route('/:id').get(getOrderById);
router.route('/:id/pay').put(updateOrderToPaid);
router.route('/:id/paymobile').put(updateOrderToPaidMobile);
router.route('/:id/wxGZHPayment').put(wxGZHPayment);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);
router.route('/:id/roulette').put(protect, updateRoulette);
router.route('/:id/PayMethod').put(protect, updateOrderPayMethod);

export default router;
