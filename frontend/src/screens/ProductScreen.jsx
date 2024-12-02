import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row,
  Col,
  Image,
  ListGroup,
  Card,
  Button,
  Form,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
} from '../slices/productsApiSlice';
import Rating from '../components/Rating';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Meta from '../components/Meta';
import { addToCart } from '../slices/cartSlice';
import ModalService from '../components/ModalService';
import ModalPromotion from '../components/ModalPromotion';
import cart from '../assets/cart.svg';
import { addOneToCart } from '../slices/cartSlice';
import gsap from 'gsap';
import wx from 'weixin-js-sdk';
import axios from 'axios';
import PannellumScreen from '../components/PannellumScreen';
import ModalPicture from '../components/ModalPicture';
import { LinkContainer } from 'react-router-bootstrap';
import { FaEdit } from 'react-icons/fa';

const ProductScreen = () => {
  const { id: productId } = useParams();
  const gsapRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty }));
    navigate('/cart');
  };
  const addOneToCartHandler = () => {
    dispatch(addOneToCart({ ...product, qty: 1 }));
    gsap.to(gsapRef.current, {
      rotation: 360,
      repeat: 2,
      yoyo: true,
      ease: 'bounce.in',
    });
  };
  const { userInfo } = useSelector((state) => state.auth);

  const [createReview, { isLoading: loadingProductReview }] =
    useCreateReviewMutation();

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await createReview({
        productId,
        rating,
        comment,
      }).unwrap();
      refetch();
      toast.success('Review created successfully');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };
  const sendNavigator = async (signal) => {
    await axios.post('/api/users/sendNavigator', {
      environment: `${navigator.userAgent}--${Date.now()}--${signal}`,
    });
  };
  let url = encodeURIComponent(window.location.href.split('#')[0]);
  const wechatConfig = async () => {
    await axios.get(`https://gzh.whtec.net/jsapi?url=${url}`).then((result) => {
      //let { appid, timestamp, noncestr, signature } = result.data;
      wx.config({
        debug: false,
        ...result.data,
        jsApiList: [
          'scanQRCode',
          'updateTimelineShareData',
          'updateAppMessageShareData',
          // 'onMenuShareTimeline',
          // 'onMenuShareQQ',
          // 'startRecord',
          // 'stopRecord',
          // 'translateVoice',
        ],
      });
      wx.ready(function () {
        wx.checkJsApi({
          jsApiList: [
            'updateTimelineShareData',
            'updateAppMessageShareData',
            // 'onMenuShareTimeline',
            // 'onMenuShareQQ',
            // 'startRecord',
            // 'stopRecord',
            // 'translateVoice',
          ],
          success: function (res) {
            // console.log('checkJsApi success');
            // console.log(navigator.userAgent, 'getSysteminfoSync');
            // alert(navigator.userAgent.indexOf('Android'));
            localStorage.setItem('wxConfig', 'true');
          },
        });
        wx.updateTimelineShareData({
          title: product.name, // 分享标题
          link: window.location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
          imgUrl: `${window.location.origin}${product.imageDesc[0]}`, // 分享图标
          success: function () {
            // sendNavigator(`${window.location.origin}${product.image}`);
            // 设置成功
          },
        });
        wx.updateAppMessageShareData({
          title: product.name, // 分享标题
          desc: product.description,
          link: window.location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
          imgUrl: `${window.location.origin}${product.imageDesc[0]}`, // 分享图标
          success: function () {
            // sendNavigator('messageShare');
            // 设置成功
          },
        });
        // wx.updateAppMessageShareData({
        //   title: '商城', // 分享标题
        //   desc: 'have a try', // 分享描述
        //   link: url, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
        //   imgUrl: 'https://buyifang.whtec.net/uploads/image-1710658881842.jpg', // 分享图标
        //   success: function () {
        //     // 设置成功
        //   },
        // });
      });
      wx.error(function (res) {
        // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
        console.log(res, '<<if wx.config ERR');
      });
    });
  };
  useEffect(() => {
    let surfModel = navigator.userAgent;
    if (surfModel.toLowerCase().match(/micromessenger/i) == 'micromessenger') {
      if (!isLoading) {
        wechatConfig();
      }
    }
  }, [isLoading]);
  return (
    <>
      <Link className='btn btn-light my-3' to='/'>
        {process.env.REACT_APP_CHINESE ? '返回' : 'Go Back'}
      </Link>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          <Meta title={product.name} description={product.description} />
          <Row>
            <Col md={6}>
              {product.image && product.image.toLowerCase().endsWith('.mp4') ? (
                <video controls style={{ width: '100%', borderRadius: '8px' }}>
                  <source src={product.image} type='video/mp4' />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <Image
                  src={product.image}
                  alt={product.name}
                  style={{ borderRadius: '8px' }}
                  fluid
                />
              )}

              {/* <PannellumScreen image={product.image} /> */}
            </Col>
            <Col md={3}>
              <ListGroup variant='flush'>
                <ListGroup.Item>
                  <Row>
                    <Col md={6} xs={6} sm={6}>
                      <h3>{product.name}</h3>
                    </Col>
                    <Col md={6} xs={6} sm={6}>
                      <Image
                        ref={gsapRef}
                        onClick={addOneToCartHandler}
                        src={cart}
                        fluid
                        rounded
                        width={40}
                      />
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <span>发布人：</span>
                  <Image src={product.user.icon} fluid width='30'></Image>
                  {product.user.name}
                </ListGroup.Item>
                <ListGroup.Item>
                  <Rating
                    value={product.rating}
                    text={`${product.numReviews} ${
                      process.env.REACT_APP_CHINESE ? '评分' : 'reviews'
                    }`}
                  />
                </ListGroup.Item>
                <ListGroup.Item>
                  {process.env.REACT_APP_CHINESE ? '价格： ' : 'Price: '}{' '}
                  {process.env.REACT_APP_CHINESE ? '¥' : '$'}
                  {product.price}
                </ListGroup.Item>
                <ListGroup.Item>
                  <ModalService />
                </ListGroup.Item>
                <ListGroup.Item>
                  {process.env.REACT_APP_CHINESE ? '活动： ' : 'Promotion: '}{' '}
                  直降优惠 优惠码折上折
                  <ModalPromotion />
                </ListGroup.Item>

                <ListGroup.Item>
                  {process.env.REACT_APP_CHINESE
                    ? '商品介绍:'
                    : 'Descrioption:'}
                  {product.description}
                </ListGroup.Item>
              </ListGroup>
            </Col>
            <Col md={3}>
              <Card>
                <ListGroup variant='flush'>
                  <ListGroup.Item>
                    <Row>
                      <Col>
                        {process.env.REACT_APP_CHINESE ? '价格' : 'Price:'}
                      </Col>
                      <Col>
                        <strong>
                          {process.env.REACT_APP_CHINESE ? '¥' : '$'}
                          {product.price}
                        </strong>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>
                        {process.env.REACT_APP_CHINESE
                          ? '在库状态： '
                          : 'Status: '}
                      </Col>
                      <Col>
                        {product.countInStock > 0
                          ? process.env.REACT_APP_CHINESE
                            ? '有库存'
                            : 'In Stock'
                          : process.env.REACT_APP_CHINESE
                          ? '库存不足'
                          : 'Out Of Stock'}
                      </Col>
                    </Row>
                  </ListGroup.Item>

                  {/* Qty Select */}
                  {
                    // {product.countInStock > 0 &&
                    <ListGroup.Item>
                      <Row>
                        <Col>
                          {process.env.REACT_APP_CHINESE ? '库存' : 'Qty'}
                        </Col>
                        <Col>
                          <Form.Control
                            as='select'
                            value={qty}
                            onChange={(e) => setQty(Number(e.target.value))}
                          >
                            {[...Array(5).keys()].map((x) => (
                              <option key={x + 1} value={x + 1}>
                                {x + 1}
                              </option>
                            ))}
                            {/* {[...Array(product.countInStock).keys()].map(
                              (x) => (
                                <option key={x + 1} value={x + 1}>
                                  {x + 1}
                                </option>
                              )
                            )} */}
                          </Form.Control>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  }

                  <ListGroup.Item>
                    <Button
                      className='btn-block'
                      type='button'
                      // disabled={product.countInStock === 0}
                      onClick={addToCartHandler}
                    >
                      {process.env.REACT_APP_CHINESE
                        ? '加入购物车'
                        : 'Add To Cart'}
                    </Button>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    {userInfo && userInfo.isAdmin ? (
                      <LinkContainer to={`/admin/product/${product._id}/edit`}>
                        <Col>
                          <Button variant='danger' className='btn-sm mx-2'>
                            <FaEdit />
                          </Button>
                        </Col>
                      </LinkContainer>
                    ) : null}
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>
          </Row>
          <Row className='review'>
            <Col md={6}>
              <h2>{process.env.REACT_APP_CHINESE ? '评价' : 'Reviews'}</h2>
              {product.reviews.length === 0 && (
                <Message>
                  {process.env.REACT_APP_CHINESE ? '未评' : 'No Reviews'}
                </Message>
              )}
              <ListGroup variant='flush'>
                {product.reviews.map((review) => (
                  <ListGroup.Item key={review._id}>
                    <strong>{review.name}</strong>
                    <Rating value={review.rating} />
                    <p>{review.createdAt.substring(0, 10)}</p>
                    <p>{review.comment}</p>
                  </ListGroup.Item>
                ))}
                <ListGroup.Item>
                  <h2>
                    {process.env.REACT_APP_CHINESE
                      ? '写评价'
                      : 'Write A Custom Review'}
                  </h2>

                  {loadingProductReview && <Loader />}

                  {userInfo ? (
                    <Form onSubmit={submitHandler}>
                      <Form.Group className='my-2' controlId='rating'>
                        <Form.Label>
                          {process.env.REACT_APP_CHINESE ? '评份' : 'Rating'}
                        </Form.Label>
                        <Form.Control
                          as='select'
                          required
                          value={rating}
                          onChange={(e) => setRating(e.target.value)}
                        >
                          <option value=''>
                            {process.env.REACT_APP_CHINESE
                              ? '选评价...'
                              : 'Select...'}
                          </option>
                          <option value='1'>
                            1 - {process.env.REACT_APP_CHINESE ? '差' : 'Poor'}
                          </option>
                          <option value='2'>
                            2 -{' '}
                            {process.env.REACT_APP_CHINESE ? '还行' : 'Fair'}
                          </option>
                          <option value='3'>
                            3 -{' '}
                            {process.env.REACT_APP_CHINESE ? '挺好' : 'Good'}
                          </option>
                          <option value='4'>
                            4 -{' '}
                            {process.env.REACT_APP_CHINESE
                              ? '相当好'
                              : 'Very Good'}
                          </option>
                          <option value='5'>
                            5 -{' '}
                            {process.env.REACT_APP_CHINESE
                              ? '卓越'
                              : 'Excellent'}
                          </option>
                        </Form.Control>
                      </Form.Group>
                      <Form.Group className='my-2' controlId='comment'>
                        <Form.Label>
                          {process.env.REACT_APP_CHINESE ? '评语' : 'Comment'}
                        </Form.Label>
                        <Form.Control
                          as='textarea'
                          row='3'
                          required
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        ></Form.Control>
                      </Form.Group>
                      <Button
                        disabled={loadingProductReview}
                        type='submit'
                        variant='primary'
                      >
                        {process.env.REACT_APP_CHINESE ? '提交' : 'Submit'}
                      </Button>
                    </Form>
                  ) : (
                    <Message>
                      {process.env.REACT_APP_CHINESE ? '请' : 'Please'}{' '}
                      <Link to='/login'>
                        {process.env.REACT_APP_CHINESE ? '请登入' : 'Sign In'}
                      </Link>{' '}
                      {process.env.REACT_APP_CHINESE
                        ? '写评价'
                        : 'to write a review'}
                    </Message>
                  )}
                </ListGroup.Item>
              </ListGroup>
            </Col>
          </Row>
          <Row>
            {product.imageDesc?.map((img, index) => {
              return (
                <Col key={index} md={6} sm={6} xs={6}>
                  {/* <Image src={img} alt={img} fluid className='rounded' /> */}
                  <ModalPicture img={img} />
                </Col>
              );
            })}
          </Row>
        </>
      )}
    </>
  );
};

export default ProductScreen;
