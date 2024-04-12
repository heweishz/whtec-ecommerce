import { LinkContainer } from 'react-router-bootstrap';
import { Table, Button } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { useGetOrdersQuery } from '../../slices/ordersApiSlice';
import { useRefundMutation } from '../../slices/paymentSlice';
import { toast } from 'react-toastify';
const OrderListScreen = () => {
  const { data: orders, refetch, isLoading, error } = useGetOrdersQuery();
  const [refund, { isLoading: isRefundLoading }] = useRefundMutation();
  const refundHandle = async (id) => {
    if (window.confirm('确定要退款？')) {
      try {
        const res = await refund(id).unwrap();
        toast.success(res.message);
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };
  return (
    <>
      <h1>{process.env.REACT_APP_CHINESE ? '订单' : 'Orders'}</h1>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <Table striped bordered hover responsive className='table-sm' size='sm'>
          <thead>
            <tr>
              <th>ID</th>
              <th>{process.env.REACT_APP_CHINESE ? '用户' : 'USER'}</th>
              <th>{process.env.REACT_APP_CHINESE ? '日期' : 'DATA'}</th>
              <th>{process.env.REACT_APP_CHINESE ? '总价' : 'TOTAL'}</th>
              <th>{process.env.REACT_APP_CHINESE ? '是否付款' : 'PAID'}</th>
              <th>{process.env.REACT_APP_CHINESE ? '发起退款' : 'REFUND'}</th>
              <th>{process.env.REACT_APP_CHINESE ? '送达' : 'DELIVERD'}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.user && order.user.name}</td>
                <td>{order.createdAt}</td>
                <td>
                  {process.env.REACT_APP_CHINESE ? '¥' : '$'}
                  {order.totalPrice}
                </td>
                <td style={{ color: 'green' }}>
                  {order.isPaid ? (
                    order.createdAt
                  ) : (
                    <FaTimes style={{ color: 'red' }} />
                  )}
                </td>
                <td>
                  {!order.isPaid ? (
                    ''
                  ) : (
                    <Button
                      variant='danger'
                      size='sm'
                      onClick={() => refundHandle(order._id)}
                    >
                      {process.env.REACT_APP_CHINESE ? '退款' : 'Refund'}
                    </Button>
                  )}
                </td>
                <td>
                  {order.isDelivered ? (
                    order.deliveredAt.substring(0, 10)
                  ) : (
                    <FaTimes style={{ color: 'red' }} />
                  )}
                </td>
                <td>
                  <LinkContainer to={`/order/${order._id}`}>
                    <Button variant='light' className='btn-sm'>
                      {process.env.REACT_APP_CHINESE ? '详情' : 'Details'}
                    </Button>
                  </LinkContainer>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default OrderListScreen;
