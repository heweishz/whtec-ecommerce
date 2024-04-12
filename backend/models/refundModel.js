import mongoose from 'mongoose';

const refundSchema = mongoose.Schema(
  {
    code: {
      type: String,
      require: true,
    },
    msg: {
      type: String,
      require: true,
    },
    buyerLogonId: {
      type: String,
      require: true,
    },
    buyerUserId: {
      type: String,
      require: true,
    },
    fundChange: {
      type: String,
      require: true,
    },
    gmtRefundPay: {
      type: String,
      require: true,
    },
    outTradeNo: {
      type: String,
      require: true,
    },
    refundFee: {
      type: String,
      require: true,
    },
    sendBackFee: {
      type: String,
      require: true,
    },
    tradeNo: {
      type: String,
      require: true,
    },
    traceId: {
      type: String,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

const Refund = mongoose.model('Refund', refundSchema);

export default Refund;
