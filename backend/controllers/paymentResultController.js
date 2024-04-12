import asyncHandler from '../middleware/asyncHandler.js';
import Order from '../models/orderModel.js';
import alipaySdk from '../utils/alipay.js';
import AlipayFormData from 'alipay-sdk/lib/form.js';
import Refund from '../models/refundModel.js';
import axios from 'axios';
// @desc    AlipayResult
// @route   POST /api/payment
// @access  Public
const alipayResult = asyncHandler(async (req, res) => {
  const {
    gmt_create,
    charset,
    gmt_payment,
    notify_time,
    subject,
    sign,
    buyer_id,
    invoice_amount,
    version,
    notify_id,
    fund_bill_list,
    notify_type,
    out_trade_no,
    total_amount,
    trade_status,
    trade_no,
    auth_app_id,
    receipt_amount,
    point_amount,
    buyer_pay_amount,
    app_id,
    sign_type,
    seller_id,
  } = req.body;
  if (trade_status === 'TRADE_SUCCESS') {
    const order = await Order.findById(out_trade_no);
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResultAlipay = {
        gmt_create,
        charset,
        gmt_payment,
        notify_time,
        subject,
        sign,
        buyer_id,
        invoice_amount,
        version,
        notify_id,
        fund_bill_list: JSON.parse(fund_bill_list),
        notify_type,
        out_trade_no,
        total_amount,
        trade_status,
        trade_no,
        auth_app_id,
        receipt_amount,
        point_amount,
        buyer_pay_amount,
        app_id,
        sign_type,
        seller_id,
      };
    }

    await order.save();
  }
  res.json({ status: 'succeed' });
});
// @desc    AlipayQuery
// @route   GET /api/payment/query/:trade_no
// @access  Public
const alipayQuery = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.out_trade_no);
  const result = await alipaySdk.exec('alipay.trade.query', {
    bizContent: {
      out_trade_no: req.params.out_trade_no,
    },
  });
  res.json({
    success: true,
    message: 'success',
    result: {
      ...result,
      orderItems: order.orderItems.reduce((a, c) => {
        return a + ' ' + c.name + ',';
      }, '商品：'),
    },
  });
});
// @desc    Redirect refund to wxPay or aliPay
// @route   GET /api/payment/refund/:order_id
// @access  Private/admin
const refundRedirect = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.order_id);
  if (order) {
    switch (order.paymentMethod) {
      case '微信支付':
        console.log('wxpay refund');
        return res.redirect(
          `/api/payment/refund/${req.params.order_id}/wxPayRefund`
        );
      case '支付宝':
        console.log('alipay refund');
        return res.redirect(
          `/api/payment/refund/${req.params.order_id}/alipayRefund`
        );
    }
  } else {
    res.status(400);
    throw new Error('order does not exist');
  }
});

// @desc    AlipayRefund
// @route   GET /api/payment/refund/:order_id/aliPayRefund
// @access  Private/admin
const alipayRefund = asyncHandler(async (req, res) => {
  if (req.user.email === process.env.REFUND_ACCOUNT) {
    const order = await Order.findById(req.params.order_id);
    if (order) {
      let bizContent = {
        refund_amount: order.paymentResultAlipay.receipt_amount,
        out_trade_no: order.paymentResultAlipay.out_trade_no,
        trade_no: order.paymentResultAlipay.trade_no,
      };
      const result = await alipaySdk.exec('alipay.trade.refund', {
        bizContent,
      });
      if (result.msg === 'Success') {
        order.isPaid = false;
        await order.save();
      }
      console.log(result, '<<result from refund<<');
      const refund = new Refund({
        code: result.code,
        msg: result.msg,
        buyerLogonId: result.buyerLogonId,
        buyerUserId: result.buyerUserId,
        fundChange: result.fundChange,
        gmtRefundPay: result.gmtRefundPay,
        outTradeNo: result.outTradeNo,
        refundFee: result.refundFee,
        sendBackFee: result.sendBackFee,
        tradeNo: result.tradeno,
        traceId: result.traceId,
      });
      await refund.save();

      res.json({
        message: `退款金额：${result.refundFee} ${result.msg}`,
        result: { ...result },
      });
    } else {
      res.json({ message: 'error' });
    }
  } else {
    res.status(404);
    throw new Error('退款请联系网站管理员，15394480249');
    // res.json({ message: 'only william ho can execute this operation' });
  }
});
// @desc    WXRefund
// @route   GET /api/payment/refund/:order_id/wxPayRefund
// @access  Private
//under test,don't use
const wxPayRefund = asyncHandler(async (req, res) => {
  if (req.user.email === process.env.REFUND_ACCOUNT) {
    const order = await Order.findById(req.params.order_id);
    if (order) {
      let body = {
        reason: 'none',
        out_trade_no: order.paymentResultWxpay.out_trade_no,
        total: order.paymentResultWxpay.amount.total,
      };
      const tmpResult = await axios.post(
        'https://gzh.whtec.net/payment/refund',
        body
      );
      setTimeout(
        () => console.log('wait a second to queryTransaction_wx'),
        1000
      );
      let resultQuery = (
        await axios.get(
          `https://gzh.whtec.net/payment/queryTransaction/?transaction_id=${order.paymentResultWxpay.transaction_id}`
        )
      ).data;
      //go to query paymentResult
      if (resultQuery.trade_state === 'REFUND') {
        order.isPaid = false;
        await order.save();
      } else {
        setTimeout(
          () => console.log('wait 5 second to queryTransaction_wx'),
          5000
        );
        resultQuery = (
          await axios.get(
            `https://gzh.whtec.net/payment/queryTransaction/?transaction_id=${order.wxPaymentResult.transaction_id}`
          )
        ).data;
        if (resultQuery.trade_state === 'REFUND') {
          order.isPaid = false;
          await order.save();
        } else return res.json({ message: '退款失败' });
      }
      console.log(resultQuery, '<<result from wxRefund<<');

      res.json({
        message: `退款成功`,
      });
    } else {
      res.json({ message: 'error' });
    }
  } else {
    res.status(404);
    throw new Error('退款请联系网站管理员，15394480249');
    // res.json({ message: 'only william ho can execute this operation' });
  }
});
// @desc    WXpayResult
// @route   POST /api/payment/wxGZHpayment
// @access  Public
const wxPaymentResult = asyncHandler(async (req, res) => {
  const {
    mchid,
    appid,
    out_trade_no,
    transaction_id,
    trade_type,
    trade_state,
    trade_state_desc,
    bank_type,
    attach,
    success_time,
    payer,
    amount,
    callbackToken,
  } = req.body;
  if (trade_state === 'SUCCESS') {
    const order = await Order.findById(out_trade_no);
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResultWxpay = {
        mchid,
        appid,
        out_trade_no,
        transaction_id,
        trade_type,
        trade_state,
        trade_state_desc,
        bank_type,
        attach,
        success_time,
        payer,
        amount,
      };
    }
    if (callbackToken === process.env.CALLBACKTOKEN) {
      await order.save();
      return res.send(true);
    }
  }

  res.send(false);
});

// @desc    TestEmptyObject
// @route   GET /api/testEmptyObject
// @access  Public
const testEmptyObject = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.query.orderId);
  if (order) {
    let total_fee = order.totalPrice * 100;
    res.redirect(
      `/api/payment/redirecttest?auth_code=${req.query.auth_code}&orderId=${req.query.orderId}&total_fee=${total_fee}`
    );
    order.isPaid = true;
    order.paidAt = Date.now();
    await order.save();
  } else {
    res.status(404);
    throw new Error('order not found!');
  }

  // const order = await Order.findById(req.query.order_id);
  // if (order) {
  //   console.log(
  //     order.paymentResultAlipay,
  //     '<<<<<<paymentResultAlipay<<<<<<<<<'
  //   );
  //   console.log(order.paymentResultWxpay, '<<<<<<<wx<<<<<<<');
  //   if (order.paymentResultAlipay.fund_bill_list.length === 0)
  //     return res.send('check array empty true');
  //   // let result = isEmpty(order.paymentResultWxpay);
  //   let result;
  //   if (order.paymentResultWxpay === undefined) {
  //     result = false;
  //   }
  //   return res.json(result);
  // }
});
const redirctTest = asyncHandler(async (req, res) => {
  await axios.post('https://gzh.whtec.net/payment/wxmicropay', {
    auth_code: req.query.auth_code,
    out_trade_no: req.query.orderId,
    device_info: process.env.DEVICE_INFO,
    total_fee: req.query.total_fee,
  });
  res.send('redirect succeed!');
});

export {
  alipayResult,
  alipayQuery,
  refundRedirect,
  alipayRefund,
  wxPayRefund,
  wxPaymentResult,
  testEmptyObject,
  redirctTest,
};

/**
 * helper function
 * @param {*} obj
 * @returns
 */
function isEmpty(obj) {
  for (const prop in obj) {
    if (Object.hasOwn(obj, prop)) {
      return false;
    }
  }

  return true;
}
