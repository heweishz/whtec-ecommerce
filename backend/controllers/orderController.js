import asyncHandler from '../middleware/asyncHandler.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import { calcPrices } from '../utils/calcPrices.js';
// import { verifyPayPalPayment, checkIfNewTransaction } from '../utils/paypal.js';
import alipaySdk from '../utils/alipay.js';
import AlipayFormData from 'alipay-sdk/lib/form.js';
// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, tableNumber } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    // NOTE: here we must assume that the prices from our client are incorrect.
    // We must only trust the price of the item as it exists in
    // our DB. This prevents a user paying whatever they want by hacking our client
    // side code - https://gist.github.com/bushblade/725780e6043eaf59415fbaf6ca7376ff

    // get the ordered items from our database
    const itemsFromDB = await Product.find({
      _id: { $in: orderItems.map((x) => x._id) },
    });

    // map over the order items and use the price from our items from database
    const dbOrderItems = orderItems.map((itemFromClient) => {
      const matchingItemFromDB = itemsFromDB.find(
        (itemFromDB) => itemFromDB._id.toString() === itemFromClient._id
      );
      return {
        ...itemFromClient,
        product: itemFromClient._id,
        price: matchingItemFromDB.price,
        _id: undefined,
      };
    });

    // calculate prices
    const { itemsPrice, taxPrice, shippingPrice, totalPrice } =
      calcPrices(dbOrderItems);

    const order = new Order({
      orderItems: dbOrderItems,
      user: req.user._id,
      shippingAddress,
      tableNumber,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  orders.forEach((order) => {
    order._doc.createdAt = order._doc.createdAt.toLocaleString();
    if (order._doc.paidAt) {
      order._doc.paidAt = order._doc.paidAt.toLocaleString();
    }
  });
  res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );
  if (order) {
    order._doc.createdAt = order._doc.createdAt.toLocaleString();
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  // NOTE: here we need to verify the payment was made to PayPal before marking
  // the order as paid
  // const { verified, value } = await verifyPayPalPayment(req.body.id);
  // console.log(verified, '<<<verified<<<');
  // if (!verified) throw new Error('Payment not verified');

  // check if this transaction has been used before
  // const isNewTransaction = await checkIfNewTransaction(Order, req.body.id);
  // console.log(isNewTransaction, '<<isNewTransaction<<<');
  // if (!isNewTransaction) throw new Error('Transaction has been used before');
  const order = await Order.findById(req.params.id);
  if (order) {
    let totalPrice = order.totalPrice;
    if (req.body.matchCode) {
      totalPrice = (Math.round(order.totalPrice * 100 * 0.95) / 100).toFixed(2);
    }
    const subject = order.orderItems.reduce((a, c) => {
      return a + ' ' + c.name;
    }, '商品：');
    const result = alipaySdk.pageExec('alipay.trade.page.pay', {
      method: 'GET',
      bizContent: {
        out_trade_no: order.id.toString(),
        total_amount: totalPrice,
        subject,
        product_code: 'FAST_INSTANT_TRADE_PAY',
      },
      returnUrl: process.env.RETURN_URL,
      notifyUrl: process.env.NOTIFY_URL,
    });
    res.json({
      success: true,
      message: '支付启动成功',
      code: 200,
      timestamp: new Date().getTime(),
      result: result,
    });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
  // check the correct amount was paid
  // const paidCorrectAmount = order.totalPrice.toString() === value;
  // if (!paidCorrectAmount) throw new Error('Incorrect amount paid');

  // order.isPaid = true;
  // order.paidAt = Date.now();
  // order.paymentResult = {
  //   id: req.body.id,
  //   status: req.body.status,
  //   update_time: req.body.update_time,
  //   email_address: req.body.payer.email_address,
  // };

  // const updatedOrder = await order.save();
  // res.json(updatedOrder);
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/paymobile
// @access  Private
const updateOrderToPaidMobile = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    let totalPrice = order.totalPrice;
    //calculate price with discount
    if (req.body.matchCode) {
      totalPrice = (Math.round(order.totalPrice * 100 * 0.95) / 100).toFixed(2);
    }
    //generate name list of commodity
    const subject = order.orderItems.reduce((a, c) => {
      return a + ' ' + c.name;
    }, '商品：');
    //invoke alipay
    const result = alipaySdk.pageExec('alipay.trade.wap.pay', {
      method: 'GET',
      bizContent: {
        out_trade_no: order.id.toString(),
        total_amount: totalPrice,
        subject,
        product_code: 'QUICK_WAP_WAY',
      },
      returnUrl: process.env.RETURN_URL,
      notifyUrl: process.env.NOTIFY_URL,
    });
    res.json({
      success: true,
      message: '支付启动成功',
      code: 200,
      timestamp: new Date().getTime(),
      result: result,
    });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/paymobile
// @access  Private
const updateOrderToPaidMobileBackup = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    // const result = alipaySdk.pageExec('alipay.trade.wap.pay', {
    //   bizContent: {
    //     out_trade_no: order.id.toString(),
    //     total_amount: order.totalPrice,
    //     subject: '娃娃',
    //     product_code: 'QUICK_WAP_WAY',
    //   },
    // });
    // console.log(result, '<<<result payMobile<<<');
    // result.then((resp) => {
    //   res.json({
    //     success: true,
    //     message: '支付启动成功',
    //     code: 200,
    //     timestamp: new Date().getTime(),
    //     result: resp,
    //   });
    // });
    const formData = new AlipayFormData.default();
    formData.setMethod('get');
    formData.addField('bizContent', {
      outTradeNo: order._id.toString(),
      productCode: 'QUICK_WAP_WAY',
      totalAmount: order.totalPrice,
      subject: '娃娃',
    });
    formData.addField('notifyUrl', process.env.NOTIFY_URL);
    formData.addField('returnUrl', process.env.RETURN_URL);
    const result = alipaySdk.exec(
      // 为可以跳转到支付链接的 url
      'alipay.trade.wap.pay', // 统一收单下单并支付页面接口
      {}, // api 请求的参数（包含“公共请求参数”和“业务参数”）
      { formData: formData }
    );
    result.then((resp) => {
      res.json({
        success: true,
        message: '支付启动成功',
        code: 200,
        timestamp: new Date().getTime(),
        result: resp,
      });
    });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});
// @desc    Get order info
// @route   GET /api/orders/:id/wxGZHPayment
// @access  private
const wxGZHPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    let totalPrice = order.totalPrice * 100;
    //calculate price with discount
    if (req.body.matchCode) {
      totalPrice =
        (Math.round(order.totalPrice * 100 * 0.95) / 100).toFixed(2) * 100;
    }
    //generate name list of commodity
    const subject = order.orderItems.reduce((a, c) => {
      return a + ' ' + c.name;
    }, '商品：');
    //invoke alipay

    res.json({
      out_trade_no: order.id.toString(),
      total_amount: totalPrice,
      subject,
      callbackToken: process.env.CALLBACKTOKEN,
    });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  orders.forEach((order) => {
    order._doc.createdAt = order._doc.createdAt.toLocaleString();
    if (order._doc.paidAt) {
      order._doc.paidAt = order._doc.paidAt.toLocaleString();
    }
  });
  res.json(orders);
});
// @desc    Update orders payment method
// @route   PUT /api/orders/:id/PayMethod
// @access  Private
const updateOrderPayMethod = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    order.paymentMethod = req.body.payment;
    await order.save();
    res.json({ success: true });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

export {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToPaidMobile,
  wxGZHPayment,
  updateOrderToDelivered,
  getOrders,
  updateOrderPayMethod,
};
