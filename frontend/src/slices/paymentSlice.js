import { apiSlice } from './apiSlice';
import { ALIPAY_URL } from '../constants';

export const paymentSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    paymentFeedback: builder.query({
      query: (out_trade_no) => ({
        url: `${ALIPAY_URL}/query/${out_trade_no}`,
      }),
      keepUnusedDataFor: 5,
    }),
    refund: builder.mutation({
      query: (order_id) => ({
        url: `${ALIPAY_URL}/refund/${order_id}`,
        method: 'GET',
      }),
    }),
  }),
});

export const { usePaymentFeedbackQuery, useRefundMutation } = paymentSlice;
