import path from 'path';
import express from 'express';
import mongoose from 'mongoose';
import asyncHandler from '../middleware/asyncHandler.js';
import Order from '../models/orderModel.js';

const router = express.Router();

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { trade_status, out_trade_no, buyer_id, trade_no, receipt_amount } =
      req.body;
    if (trade_status === 'TRADE_SUCCESS') {
      const order = await Order.findById(out_trade_no);
      if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResultAlipay = {
          buyer_id,
          trade_status,
          trade_no,
          receipt_amount,
        };
      }
      await order.save();
    }
    res.json({ status: 'succeed' });
  })
);

export default router;
