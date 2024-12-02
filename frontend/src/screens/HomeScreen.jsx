import { Row, Col, Container, Button } from 'react-bootstrap';
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
import { setProductsSort } from '../slices/productsSortSlice';
import { useEffect } from 'react';
import { useLoginMutation } from '../slices/usersApiSlice';
import { toast } from 'react-toastify';
import NavbarCategory from './NavbarCategory';

import wx from 'weixin-js-sdk';
import axios from 'axios';
import PannellumScreen from '../components/PannellumScreen';
import panorama from '../assets/jinlinercamp.jpg';

const isAndroid = () => /Android/i.test(navigator.userAgent);
const HomeScreen = () => {
  const dispatch = useDispatch();

  const changeSort = (e) => {
    dispatch(setProductsSort(e.target.value));
  };
  const { productsSort } = useSelector((state) => state.sort);
  const language = localStorage.getItem('language');
  const { pageNumber, keyword, category } = useParams();
  const sort = productsSort;
  const { data, isLoading, error } = useGetProductsQuery({
    keyword,
    category,
    pageNumber,
    sort,
    filterStock: true,
  });

  const [login, { isLoadingUser }] = useLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const wechatConfig = async () => {
    console.log('wechatConfig inner <<<<<<');
    let url = encodeURIComponent(window.location.href.split('#')[0]);
    await axios.get(`https://gzh.whtec.net/jsapi?url=${url}`).then((result) => {
      //let { appid, timestamp, noncestr, signature } = result.data;
      wx.config({
        debug: false,
        ...result.data,
        jsApiList: ['updateTimelineShareData', 'updateAppMessageShareData'],
      });
      wx.ready(function () {
        wx.checkJsApi({
          jsApiList: ['updateTimelineShareData', 'updateAppMessageShareData'],
          success: function (res) {},
        });
        wx.updateTimelineShareData({
          title: '花火烧烤', // 分享标题
          link: window.location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
          imgUrl: 'https://buyifang.whtec.net/images/bbq.jpg', // 分享图标
          success: function () {
            // 设置成功
            console.log('updateTimeLineShareData set success');
          },
        });
        wx.updateAppMessageShareData({
          title: '花火烧烤', // 分享标题
          desc: '老东北味道',
          link: window.location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
          imgUrl: `${window.location.origin}/images/bbq.jpg`, // 分享图标
          success: function () {
            // sendNavigator('messageShare');
            // 设置成功
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
    let surfModel = navigator.userAgent;
    if (surfModel.toLowerCase().match(/micromessenger/i) == 'micromessenger') {
      console.log('---------debug 01 -------');
      wechatConfig();
    }
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
      {!keyword && !category ? (
        isAndroid() ? (
          <ProductCarousel />
        ) : (
          // <ProductCarousel />
          <Container>
            <Row>
              <Col xs={1}></Col>
              <Col xs={10}>
                <PannellumScreen image={panorama} fluid />
              </Col>
              <Col xs={1}></Col>
            </Row>
          </Container>
        )
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
          <Meta title='桅梁科技' />
          <h1>
            {process.env.REACT_APP_CHINESE ? '最新商品' : 'Latest Products'}
          </h1>

          <Row>
            <NavbarCategory
              pages={data.pages}
              page={data.page}
              keyword={keyword ? keyword : ''}
            />
          </Row>
          <Row>
            <Col>
              <Button value='name' onClick={(e) => changeSort(e)}>
                名字排序
              </Button>
              <Button value='-updatedAt' onClick={(e) => changeSort(e)}>
                上新排序
              </Button>
            </Col>
          </Row>
          <Row>
            {data.products.map((product) => (
              <Col key={product._id} xs={6} sm={6} md={6} lg={4} xl={3}>
                {product.image &&
                product.image.toLowerCase().endsWith('.mp4') ? (
                  <Product product={product} isVideo={true} />
                ) : (
                  <Product product={product} />
                )}
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
