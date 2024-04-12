import { Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useGetProductsQuery } from '../slices/productsApiSlice';
import { Link } from 'react-router-dom';
import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Paginate from '../components/Paginate';
import ProductCarousel from '../components/ProductCarousel';
import Meta from '../components/Meta';

import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../slices/authSlice';
import { useEffect } from 'react';
import { useLoginMutation } from '../slices/usersApiSlice';
import { toast } from 'react-toastify';
import NavbarCategory from './NavbarCategory';

import wx from 'weixin-js-sdk';
import axios from 'axios';
const HomeScreen = () => {
  const language = localStorage.getItem('language');
  const { pageNumber, keyword, category } = useParams();
  const { data, isLoading, error } = useGetProductsQuery({
    keyword,
    category,
    pageNumber,
  });

  const [login, { isLoadingUser }] = useLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const wechatConfig = async () => {
    let url = encodeURIComponent(window.location.href.split('#')[0]);
    await axios.get(`https://gzh.whtec.net/jsapi?url=${url}`).then((result) => {
      //let { appid, timestamp, noncestr, signature } = result.data;
      wx.config({
        debug: false,
        ...result.data,
        jsApiList: ['updateTimelineShareData'],
      });
      wx.ready(function () {
        wx.checkJsApi({
          jsApiList: ['updateTimelineShareData'],
          success: function (res) {
            console.log('homeScreen checkJsApi');
            wx.updateTimelineShareData({
              title: '商城', // 分享标题
              link: url, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
              imgUrl:
                'https://buyifang.whtec.net/uploads/image-1710658881842.jpg', // 分享图标
              success: function () {
                // 设置成功
                console.log('updateTimeLineShareData set success');
              },
            });
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
    // wx.checkJsApi({
    //   jsApiList: ['scanQRCode'],
    //   success: function (res) {
    //     console.log('<<start wechatConfig>>');
    //     wechatConfig();
    //   },
    // });
    if (!userInfo && false) {
      async function autoLogin() {
        try {
          const res = await login({
            email: '88@gmail.com',
            password: '88hao',
          }).unwrap();
          dispatch(setCredentials({ ...res }));
        } catch (err) {
          toast.error(err?.data?.message || err.error);
        }
      }
      autoLogin();
    }
  }, [dispatch, login, userInfo]);

  return (
    <>
      {!keyword ? (
        <ProductCarousel />
      ) : (
        <Link to='/' className='btn btn-light mb-4'>
          {process.env.REACT_APP_CHINESE ? '返回' : 'Go Back'}
        </Link>
      )}
      {isLoading || isLoadingUser ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          <Meta title='米兰坊' />
          <h1>
            {process.env.REACT_APP_CHINESE ? '最新商品' : 'Latest Products'}
          </h1>
          <Row>
            <NavbarCategory
              pages={data.pages}
              page={data.page}
              keyword={keyword ? keyword : ''}
            />
            {data.products.map((product) => (
              <Col key={product._id} xs={6} sm={6} md={6} lg={4} xl={3}>
                <Product product={product} />
              </Col>
            ))}
          </Row>
          <Paginate
            pages={data.pages}
            page={data.page}
            category={category ? category : ''}
            keyword={keyword ? keyword : ''}
          />
        </>
      )}
    </>
  );
};

export default HomeScreen;
