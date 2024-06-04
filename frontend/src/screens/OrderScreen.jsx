import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Form,
  Row,
  Col,
  ListGroup,
  Image,
  Card,
  Button,
} from 'react-bootstrap';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import Message from '../components/Message';
import Loader from '../components/Loader';
import {
  useDeliverOrderMutation,
  useGetOrderDetailsQuery,
  useGetPaypalClientIdQuery,
  usePayOrderMutation,
  usePayOrderMobileMutation,
  useWxGetOrderMutation,
  usePayMethodMutation,
} from '../slices/ordersApiSlice';
// import { savePaymentMethod } from '../slices/cartSlice';
import styles from './OrderScreen.module.css';
import axios from 'axios';
import wx from 'weixin-js-sdk';
const promotionCodes = ['freedoll'];

const OrderScreen = () => {
  const { id: orderId } = useParams();
  const [code, setCode] = useState('');
  const [matchCode, setMatchCode] = useState(false);
  const [showOrHide, setShowOrHide] = useState(true);
  const {
    data: order,
    refetch,
    isLoading,
    error,
  } = useGetOrderDetailsQuery(orderId);
  // const navigate = useNavigate();
  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();
  const [payOrderMobile, { isLoading: loadingPayMobile }] =
    usePayOrderMobileMutation();
  const [wxGetOrder, { isLoading: loadingWxGetOrder }] =
    useWxGetOrderMutation();
  const [payMethod] = usePayMethodMutation();
  const [deliverOrder, { isLoading: loadingDeliver }] =
    useDeliverOrderMutation();

  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  const {
    data: paypal,
    isLoading: loadingPayPal,
    error: errorPayPal,
  } = useGetPaypalClientIdQuery();

  // useEffect(() => {
  //   navigate('/');
  // }, []);
  let url = encodeURIComponent(window.location.href.split('#')[0]);
  const wechatConfig = async () => {
    await axios.get(`https://gzh.whtec.net/jsapi?url=${url}`).then((result) => {
      //let { appid, timestamp, noncestr, signature } = result.data;
      wx.config({
        debug: false,
        ...result.data,
        jsApiList: [
          'scanQRCode',
          // 'onMenuShareTimeline',
          // 'onMenuShareQQ',
          // 'startRecord',
          // 'stopRecord',
          // 'translateVoice',
        ],
      });
      wx.ready(function () {
        wx.checkJsApi({
          jsApiList: ['scanQRCode'],
          success: function (res) {
            //render alipay or not
            localStorage.setItem('wxConfig', 'true');
          },
        });
      });
      wx.error(function (res) {
        // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
        console.log(res, '<<if wx.config ERR');
      });
    });
  };
  useEffect(() => {
    setMatchCode(promotionCodes.find((promotionCode) => code == promotionCode));
    if (!errorPayPal && !loadingPayPal && paypal.clientId) {
      const loadPaypalScript = async () => {
        paypalDispatch({
          type: 'resetOptions',
          value: {
            'client-id': paypal.clientId,
            currency: 'USD',
          },
        });
        paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
      };
      if (order && !order.isPaid) {
        if (!window.paypal) {
          // loadPaypalScript();
        }
      }
    }
    // wx.ready(function () {
    //   wx.checkJsApi({
    //     jsApiList: ['scanQRCode'],
    //     success: function (res) {
    //       //render alipay or not

    //     },
    //   });
    // });
    let surfModel = navigator.userAgent;
    if (surfModel.toLowerCase().match(/micromessenger/i) == 'micromessenger') {
      setShowOrHide(false);
      wechatConfig();
    }
  }, [code, order]);

  async function alipay() {
    // dispatch(savePaymentMethod('支付宝'));
    try {
      const res = await payOrder({
        orderId,
        matchCode,
      }).unwrap();
      await payMethod({ orderId, payment: '支付宝' });
      toast.success(res.message);
      window.location.href = res.result;
      // window.open(res.result);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  }
  async function alipayMobile() {
    // dispatch(savePaymentMethod('支付宝'));
    try {
      const res = await payOrderMobile({
        orderId,
        matchCode,
      }).unwrap();
      await payMethod({ orderId, payment: '支付宝' });
      toast.success(res.message);
      // console.log(res.result);
      window.location.href = res.result;
      // window.open(res.result);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  }
  async function wxPayment() {
    // dispatch(savePaymentMethod('微信支付'));

    let openid;
    try {
      if (userInfo && userInfo.email) {
        openid = userInfo.email.split('@')[0];
      }
      //fetch order info
      // const orderInfo = await axios.put(
      //   '/api/orders/65f10e482de08181525d6413/wxgzhpayment',
      //   { test: 'test' }
      // );
      const { out_trade_no, total_amount, subject, callbackToken } =
        await wxGetOrder({
          orderId,
          matchCode,
        }).unwrap();

      const result = (
        await axios.post('https://gzh.whtec.net/payment/prepay', {
          openid,
          money: total_amount,
          subject: `${subject} ${
            order.tableNumber ? order.tableNumber + '号桌' : ''
          }`,
          out_trade_no,
          hostname: process.env.REACT_APP_HOSTNAME,
          callbackToken,
        })
      ).data;
      await payMethod({ orderId, payment: '微信支付' });
      /* eslint-disable */
      WeixinJSBridge.invoke('getBrandWCPayRequest', result, function (res) {
        if (res.err_msg == 'get_brand_wcpay_request:ok') {
          // 使用以上方式判断前端返回,微信团队郑重提示：
          //res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。

          toast.success(res);
          window.location.href = `${process.env.REACT_APP_RETURN_URL_WX}?out_trade_no=${out_trade_no}`;
        }
      });
      /* eslint-enable */
    } catch (error) {
      console.log(error, 'invoke payment errer');
    }
  }

  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        await payOrder({ orderId, details });
        refetch();
        toast.success('Order is paid');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    });
  }

  // TESTING ONLY! REMOVE BEFORE PRODUCTION
  // async function onApproveTest() {
  //   await payOrder({ orderId, details: { payer: {} } });
  //   refetch();

  //   toast.success('Order is paid');
  // }

  function onError(err) {
    toast.error(err.message);
  }

  function createOrder(data, actions) {
    return actions.order
      .create({
        purchase_units: [
          {
            amount: { value: order.totalPrice },
          },
        ],
      })
      .then((orderID) => {
        return orderID;
      });
  }
  async function sendNavigator(signal) {
    await axios.post('/api/users/sendNavigator', {
      environment: `${navigator.userAgent}--${Date.now()}--${signal}`,
    });
  }
  const scanCode = () => {
    sendNavigator('scanCode');
    wx.scanQRCode({
      needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
      scanType: ['qrCode', 'barCode'], // 可以指定扫二维码还是一维码，默认二者都有
      success: async function (res) {
        var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
        sendNavigator(result);
        await axios.get(
          `/api/payment/testEmptyObject?auth_code=${result}&orderId=${order._id}`
        );
      },
    });
  };

  const deliverHandler = async () => {
    await deliverOrder(orderId);
    refetch();
  };
  const queryPaymentHandler = async () => {};
  return isLoading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger'>{error.data.message}</Message>
  ) : (
    <>
      <div className={styles.orderNumber}>
        <h1>
          {process.env.REACT_APP_CHINESE ? '订单号' : 'Order'} {order._id}
        </h1>
        <h1>
          {process.env.REACT_APP_CHINESE ? '下单时间' : 'order time'}{' '}
          {order.createdAt}
        </h1>
      </div>
      <Row>
        <Col md={8}>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h2>{process.env.REACT_APP_CHINESE ? '收货地址' : 'Shipping'}</h2>
              <p>
                <strong>
                  {process.env.REACT_APP_CHINESE ? '名字:' : 'Name:'}
                </strong>{' '}
                {order.user.name}
              </p>
              {/* <p>
                <strong>Email: </strong>{' '}
                <a href={`mailto:${order.user.email}`}>{order.user.email}</a>
              </p> */}
              <p>
                <strong>
                  {process.env.REACT_APP_CHINESE ? '地址：' : 'Address:'}
                </strong>
                {order.shippingAddress.address}, {order.shippingAddress.city} ,{' '}
                {order.shippingAddress.country},
                {order.shippingAddress.postalCode}
              </p>

              {order.tableNumber && <p>{order.tableNumber} 号桌</p>}
            </ListGroup.Item>
            <ListGroup.Item>
              <Row>
                <Col className={styles.websitePayment}>
                  <Button className='btn btn-info' onClick={alipay}>
                    网页支付宝付款
                  </Button>
                </Col>
                {showOrHide && (
                  <Col className={styles.mobilePayment}>
                    <Button className='btn btn-info' onClick={alipayMobile}>
                      手机支付宝付款
                    </Button>
                  </Col>
                )}
                {!showOrHide && (
                  <Col className={styles.wxPayment}>
                    <Button className='btn btn-success' onClick={wxPayment}>
                      微信付款
                    </Button>
                  </Col>
                )}
                {userInfo && userInfo.isAdmin && !order.isPaid && (
                  <Col>
                    <Button onClick={scanCode}>商家扫码收款</Button>
                  </Col>
                )}
              </Row>
            </ListGroup.Item>
            <ListGroup.Item>
              {/* <h2>
                {process.env.REACT_APP_CHINESE ? '支付方式' : 'Payment Method'}
              </h2>
              <p>
                <strong>{order.paymentMethod}</strong>
              </p> */}

              {order.isPaid ? (
                <Message variant='success'>
                  Paid on {order.createdAt.substring(0, 10)}
                </Message>
              ) : (
                <Message variant='danger'>
                  {process.env.REACT_APP_CHINESE ? '未支付' : 'Not Paid'}
                </Message>
              )}
              {order.isDelivered ? (
                <Message variant='success'>
                  Delivered on {order.deliveredAt.substring(0, 10)}
                </Message>
              ) : (
                <Message variant='danger'>
                  {process.env.REACT_APP_CHINESE ? '未发货' : 'Not Delivered'}
                </Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>
                {process.env.REACT_APP_CHINESE ? '订单列表' : 'Order Items'}
              </h2>
              {order.orderItems.length === 0 ? (
                <Message>
                  {process.env.REACT_APP_CHINESE
                    ? '你的购物车为空'
                    : 'Order is empty'}
                </Message>
              ) : (
                <ListGroup variant='flush'>
                  {order.orderItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row>
                        <Col md={1}>
                          <Image
                            src={item.image}
                            alt={item.name}
                            fluid
                            rounded
                          />
                        </Col>
                        <Col>
                          <Link to={`/product/${item.product}`}>
                            {item.name}
                          </Link>
                        </Col>
                        <Col md={4}>
                          {item.qty} x{' '}
                          {process.env.REACT_APP_CHINESE ? '¥' : '$'}
                          {item.price} ={' '}
                          {process.env.REACT_APP_CHINESE ? '¥' : '$'}
                          {item.qty * item.price}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>
          <Card>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <h2>
                  {process.env.REACT_APP_CHINESE ? '订单详情' : 'Order Summary'}
                </h2>
              </ListGroup.Item>
              {/* <ListGroup.Item>
                <Row>
                  <Col>Items</Col>
                  <Col>${order.itemsPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Shipping</Col>
                  <Col>${order.shippingPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Tax</Col>
                  <Col>${order.taxPrice}</Col>
                </Row>
              </ListGroup.Item> */}
              <ListGroup.Item>
                <Row>
                  <Col>{process.env.REACT_APP_CHINESE ? '总价' : 'Total'}</Col>
                  <Col>
                    {process.env.REACT_APP_CHINESE ? '¥' : '$'}
                    {matchCode
                      ? (
                          Math.round(order.totalPrice * 100 * 0.95) / 100
                        ).toFixed(2)
                      : order.totalPrice}
                  </Col>
                </Row>
              </ListGroup.Item>
              {!order.isPaid && (
                <ListGroup.Item>
                  {loadingPay && <Loader />}

                  {isPending ? (
                    <Loader />
                  ) : (
                    <div>
                      {/* THIS BUTTON IS FOR TESTING! REMOVE BEFORE PRODUCTION! */}
                      {/* <Button
                        style={{ marginBottom: '10px' }}
                        onClick={onApproveTest}
                      >
                        Test Pay Order
                      </Button> */}

                      {/* <div>
                        <PayPalButtons
                          createOrder={createOrder}
                          onApprove={onApprove}
                          onError={onError}
                        ></PayPalButtons>
                      </div> */}
                      <Form>
                        <Form.Group className='my-2' controlId='code'>
                          <Form.Label>
                            {process.env.REACT_APP_CHINESE
                              ? '优惠码'
                              : 'promotion code'}
                          </Form.Label>
                          <Form.Control
                            className={matchCode ? 'border-success' : ''}
                            type='text'
                            placeholder='输入优惠码'
                            value={code}
                            required
                            onChange={(e) => setCode(e.target.value)}
                          ></Form.Control>
                        </Form.Group>
                      </Form>
                    </div>
                  )}
                </ListGroup.Item>
              )}

              {loadingDeliver && <Loader />}

              {userInfo &&
                userInfo.isAdmin &&
                order.isPaid &&
                !order.isDelivered && (
                  <ListGroup.Item>
                    <Button
                      type='button'
                      className='btn btn-block'
                      onClick={deliverHandler}
                    >
                      Mark As Delivered
                    </Button>
                  </ListGroup.Item>
                )}
            </ListGroup>
          </Card>
          <Card>
            {order.isPaid && (
              <ListGroup>
                <ListGroup.Item>
                  <Row>
                    <Col>buyer_id</Col>
                    <Col>{order.paymentResultAlipay?.buyer_id}</Col>
                  </Row>
                  <Row>
                    <Col>trade_no</Col>
                    <Col>{order.paymentResultAlipay?.trade_no}</Col>
                  </Row>
                  <Row>
                    <Col>total_amount</Col>
                    <Col>{order.paymentResultAlipay?.total_amount}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Button
                    type='button'
                    className='btn btn-block'
                    onClick={queryPaymentHandler}
                  >
                    Query payment
                  </Button>
                </ListGroup.Item>
              </ListGroup>
            )}
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default OrderScreen;
