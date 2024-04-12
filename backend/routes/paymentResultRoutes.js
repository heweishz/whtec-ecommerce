import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();
import {
  alipayResult,
  alipayQuery,
  refundRedirect,
  alipayRefund,
  wxPayRefund,
  wxPaymentResult,
  testEmptyObject,
  redirctTest,
} from '../controllers/paymentResultController.js';

router.route('/').post(alipayResult);
router.route('/query/:out_trade_no').get(alipayQuery);
router.route('/refund/:order_id').get(protect, admin, refundRedirect);
router
  .route('/refund/:order_id/aliPayRefund')
  .get(protect, admin, alipayRefund);
router.route('/refund/:order_id/wxPayRefund').get(protect, admin, wxPayRefund);
router.route('/wxGZHpayment').post(wxPaymentResult);
router.route('/testEmptyObject').get(testEmptyObject);
router.route('/redirectTest').get(redirctTest);

export default router;
