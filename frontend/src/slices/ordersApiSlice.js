import { apiSlice } from './apiSlice';
import { ORDERS_URL, PAYPAL_URL } from '../constants';

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (order) => ({
        url: ORDERS_URL,
        method: 'POST',
        body: order,
      }),
    }),
    getOrderDetails: builder.query({
      query: (id) => ({
        url: `${ORDERS_URL}/${id}`,
      }),
      keepUnusedDataFor: 5,
    }),
    payOrder: builder.mutation({
      query: (data) => ({
        url: `${ORDERS_URL}/${data.orderId}/pay`,
        method: 'PUT',
        body: data,
      }),
    }),
    payOrderMobile: builder.mutation({
      query: (data) => ({
        url: `${ORDERS_URL}/${data.orderId}/paymobile`,
        method: 'PUT',
        body: data,
      }),
    }),
    wxGetOrder: builder.mutation({
      query: (data) => ({
        url: `${ORDERS_URL}/${data.orderId}/wxGZHpayment`,
        method: 'PUT',
        body: data,
      }),
    }),
    getPaypalClientId: builder.query({
      query: () => ({
        url: PAYPAL_URL,
      }),
      keepUnusedDataFor: 5,
    }),
    getMyOrders: builder.query({
      query: () => ({
        url: `${ORDERS_URL}/mine`,
      }),
      keepUnusedDataFor: 5,
    }),
    getOrders: builder.query({
      query: () => ({
        url: ORDERS_URL,
      }),
      keepUnusedDataFor: 5,
    }),
    deliverOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/deliver`,
        method: 'PUT',
      }),
    }),
    payMethod: builder.mutation({
      query: (data) => ({
        url: `${ORDERS_URL}/${data.orderId}/payMethod`,
        method: 'PUT',
        body: data,
      }),
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrderDetailsQuery,
  usePayOrderMutation,
  usePayOrderMobileMutation,
  useWxGetOrderMutation,
  useGetPaypalClientIdQuery,
  useGetMyOrdersQuery,
  useGetOrdersQuery,
  useDeliverOrderMutation,
  usePayMethodMutation,
} = orderApiSlice;
