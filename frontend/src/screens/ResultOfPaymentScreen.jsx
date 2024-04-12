// import { useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { usePaymentFeedbackQuery } from '../slices/paymentSlice';
// import { useGetMyOrdersQuery } from '../slices/ordersApiSlice';

import { Card } from 'react-bootstrap';
import Loader from '../components/Loader';
import Message from '../components/Message';
const paymentParams = [
  'out_trade_no',
  'method',
  'total_amount',
  'sign',
  'trade_no',
  'auth_app_id',
  'version',
  'app_id',
  'sign_type',
  'seller_id',
  'timestamp',
];

// const dumpCheckDetails = {
//   code: '10000',
//   msg: 'Success',
//   buyerLogonId: 'hew***@163.com',
//   buyerPayAmount: '0.00',
//   buyerUserId: '2088002352609432',
//   invoiceAmount: '0.00',
//   outTradeNo: '6558cc46ff413cdd07ebfa2d',
//   pointAmount: '0.00',
//   receiptAmount: '0.00',
//   sendPayDate: '2023-11-18 22:38:39',
//   totalAmount: '0.02',
//   tradeNo: '2023111822001409431419256101',
//   tradeStatus: 'TRADE_SUCCESS',
//   traceId: '218a002317003183339271151ea44f',
// };

const ResultOfPaymentScreen = () => {
  const location = useLocation();
  const locationUrl = new URLSearchParams(location.search);
  const outTradeNo = locationUrl.get('out_trade_no');

  // const details = paymentParams.reduce((a, c) => {
  //   return (a = { ...a, [c]: locationUrl.get(c) });
  // }, {});
  const {
    data: paymentResult,
    isLoading,
    error,
    refetch,
  } = usePaymentFeedbackQuery(outTradeNo);
  // const {
  //   data: orders,
  //   isLoadingOrdersQuery,
  //   errorOrderQuery,
  // } = useGetMyOrdersQuery();
  // useEffect(() => {
  //   navigate('/profile');
  // }, [paymentResult]);

  return (
    <>
      <h1>感谢购买！这是您的购买信息：</h1>
      {isLoading ? (
        <Loader />
      ) : paymentResult ? (
        <Card className='my-3 p-3 rounded'>
          <Card.Body>
            <Card.Title as='div' className='product-title'>
              {paymentResult.result.orderItems}
            </Card.Title>
            <Card.Title as='div' className='product-title'>
              付款金额：<strong>{paymentResult.result.totalAmount}</strong>
            </Card.Title>
            <Card.Text as='div'>
              付款账号：{paymentResult.result.buyerLogonId}
            </Card.Text>
            <Card.Text as='div'>
              付款时间：{paymentResult.result.sendPayDate}
            </Card.Text>
          </Card.Body>
        </Card>
      ) : (
        ''
      )}
    </>
  );
};
export default ResultOfPaymentScreen;
