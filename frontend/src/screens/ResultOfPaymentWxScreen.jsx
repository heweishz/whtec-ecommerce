import { useLocation } from 'react-router-dom';
// import { useGetMyOrdersQuery } from '../slices/ordersApiSlice';
import { useGetOrderDetailsQuery } from '../slices/ordersApiSlice';
import { Card } from 'react-bootstrap';
import Loader from '../components/Loader';

const ResultOfPaymentWxScreen = () => {
  const location = useLocation();
  const locationUrl = new URLSearchParams(location.search);
  const outTradeNo = locationUrl.get('out_trade_no');
  const {
    data: paymentResult,
    isLoading,
    error,
    refetch,
  } = useGetOrderDetailsQuery(outTradeNo);

  return (
    <>
      <h1>感谢购买！这是您的购买信息：</h1>
      {isLoading ? (
        <Loader />
      ) : paymentResult ? (
        <Card className='my-3 p-3 rounded'>
          <Card.Body>
            <Card.Title as='div' className='product-title'>
              {paymentResult.orderItems.reduce((a, c) => {
                return a + ' ' + c.name + ',';
              }, '商品：')}
            </Card.Title>
            <Card.Title as='div' className='product-title'>
              付款金额：<strong>{paymentResult.itemsPrice}</strong>
            </Card.Title>
            <Card.Text as='div'>
              付款时间：{paymentResult.paymentResultWxpay?.success_time}
            </Card.Text>
          </Card.Body>
        </Card>
      ) : (
        ''
      )}
    </>
  );
};
export default ResultOfPaymentWxScreen;
