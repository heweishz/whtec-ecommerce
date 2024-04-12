import mongoose from 'mongoose';

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
      },
    ],
    shippingAddress: {
      address: { type: String },
      city: { type: String },
      postalCode: { type: String },
      country: { type: String },
      phone: { type: String },
    },
    tableNumber: {
      type: String,
      required: false,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentResultAlipay: {
      gmt_create: { type: String },
      charset: { type: String },
      gmt_payment: { type: String },
      notify_time: { type: String },
      subject: { type: String },
      sign: { type: String },
      buyer_id: { type: String },
      invoice_amount: { type: String },
      version: { type: String },
      notify_id: { type: String },
      fund_bill_list: {
        type: [
          {
            amount: String,
            fundChannel: String,
          },
        ],
      },
      notify_type: { type: String },
      out_trade_no: { type: String },
      total_amount: { type: String },
      trade_status: { type: String },
      trade_no: { type: String },
      auth_app_id: { type: String },
      receipt_amount: { type: String },
      point_amount: { type: String },
      buyer_pay_amount: { type: String },
      app_id: { type: String },
      sign_type: { type: String },
      seller_id: { type: String },
    },
    paymentResultWxpay: {
      mchid: { type: String },
      appid: { type: String },
      out_trade_no: { type: String },
      transaction_id: { type: String },
      trade_type: { type: String },
      trade_state: { type: String },
      trade_state_desc: { type: String },
      bank_type: { type: String },
      attach: { type: String },
      success_time: { type: String },
      payer: {
        openid: { type: String },
      },
      amount: {
        total: { type: String },
        payer_total: { type: String },
        currency: { type: String },
        payer_currency: { type: String },
      },
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
