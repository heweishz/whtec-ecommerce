import { Pagination, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useGetCategoryQuery } from '../slices/productsApiSlice';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import { useEffect } from 'react';
// import { wx } from 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js';
import wx from 'weixin-js-sdk';
import axios from 'axios';
import {
  useLoginMutation,
  useRegisterMutation,
  useVerifyEmailQuery,
} from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

const NavbarCategory = ({ pages, page, keyword = '' }) => {
  let url = encodeURIComponent(window.location.href.split('#')[0]);
  const [login, { isLoadingUser }] = useLoginMutation();
  const [register, { isRegisterUser }] = useRegisterMutation();
  // const { data: emailAlreadyExist, isLoading: isVerifyEmailLoading } =
  //   useVerifyEmailQuery('heweishz@gmail.com');
  const { data: categories, isLoading } = useGetCategoryQuery();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const location = useLocation();
  const locationURL = new URLSearchParams(location.search);
  const codeWechat = locationURL.get('code');
  const tableNumber = locationURL.get('table');
  if (tableNumber) {
    localStorage.setItem('tableNumber', tableNumber);
  }
  const codeAli = locationURL.get('auth_code');
  let wechatUser;
  const wechatConfig = async () => {
    await axios.get(`https://gzh.whtec.net/jsapi?url=${url}`).then((result) => {
      //let { appid, timestamp, noncestr, signature } = result.data;
      wx.config({
        debug: true,
        ...result.data,
        jsApiList: [
          'scanQRCode',
          'updateTimelineShareData',
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
            'scanQRCode',
            'updateTimelineShareData',
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
          },
        });
        wx.updateTimelineShareData({
          title: '商城', // 分享标题
          link: window.location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
          imgUrl: 'https://buyifang.whtec.net/uploads/image-1710658881842.jpg', // 分享图标
          success: function () {
            console.log('设置成功');
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
  const wxpayment = async () => {
    let openid;
    try {
      if (userInfo) {
        openid = userInfo.email.split('@')[0];
      }
      const result = (
        await axios.post('https://gzh.whtec.net/payment/prepay', {
          openid,
          money: 3,
        })
      ).data;
      /* eslint-disable */
      WeixinJSBridge.invoke('getBrandWCPayRequest', result, function (res) {
        if (res.err_msg == 'get_brand_wcpay_request:ok') {
          // 使用以上方式判断前端返回,微信团队郑重提示：
          //res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
          console.log(res, '<<<invoke payment');
        }
      });
      /* eslint-enable */
    } catch (error) {
      console.log(error, 'invoke payment errer');
    }
  };
  const scanCode = () => {
    wx.scanQRCode({
      needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
      scanType: ['qrCode', 'barCode'], // 可以指定扫二维码还是一维码，默认二者都有
      success: async function (res) {
        var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
        alert(result);
        await axios.get(`/api/payment/testEmptyObject?auth_code=${result}`);
      },
    });
  };
  const getBaseCode = async () => {
    const result = await axios.get(
      `https://gzh.whtec.net/user/getcode?hostname=${process.env.REACT_APP_HOSTNAME}`
    );
    window.location.href = result.data;
  };
  const getInteractCode = async () => {
    const result = await axios.get(
      `https://gzh.whtec.net/user/getinteractcode?hostname=${process.env.REACT_APP_HOSTNAME}`
    );
    window.location.href = result.data;
  };

  const getWechatUser = async () => {
    if (!codeWechat) {
      await getBaseCode();
    } else {
      try {
        const result = await axios.post(
          `https://gzh.whtec.net/user/getUserinfo`,
          { code: codeWechat }
        );
        wechatUser = result.data;

        //verify email already registered

        // const emailAlreadyExist = await verifyEmail({
        //   email: wechatUser.openid + '@email.com',
        // });
        const emailAlreadyExist = await axios.get(
          `/api/users/extra/${wechatUser.openid}@email.com`
        );
        if (!emailAlreadyExist.data) {
          //getDetailWechatInfo
          if (!wechatUser.nickname) {
            return getInteractCode();
          }
          //register new user
          // console.log(location, `location when user isn't registered`);
          try {
            const res = await register({
              name: wechatUser.nickname,
              email: wechatUser.openid + '@email.com',
              password: '123456',
              icon: wechatUser.headimgurl,
            }).unwrap();
            dispatch(setCredentials({ ...res }));
          } catch (err) {
            toast.error(err?.data?.message || err.error);
          }
        } else {
          //login user
          try {
            const res = await login({
              email: wechatUser.openid + '@email.com',
              password: '123456',
            }).unwrap();
            dispatch(setCredentials({ ...res }));
            if (res.icon !== wechatUser.headimgurl) {
              axios
                .patch(`/api/users/icon/${res._id}`, {
                  icon: wechatUser.headimgurl,
                })
                .then((res) => console.log('updateUserIcon'))
                .catch((err) => toast.error(err?.data?.message || err.error));
            }
            if (res.name !== wechatUser.nickname) {
              axios
                .patch(`/api/users/name/${res._id}`, {
                  name: wechatUser.nickname,
                })
                .then((res) => console.log('updateUserName'))
                .catch((err) => toast.error(err?.data?.message || err.error));
            }
          } catch (err) {
            toast.error(err?.data?.message || err.error);
          }
        }

        return result.data;
      } catch (error) {
        console.log(error);
      }
    }
  };
  const getTaobaoUser = async () => {
    if (!codeAli) {
      await getCodeAli();
    } else {
      await getAliUser();
    }
  };
  const getCodeAli = async () => {
    try {
      const result = await axios.get(
        `/api/users/aliLogin?hostname=${process.env.REACT_APP_HOSTNAME}`
      );
      window.location.href = result.data;
    } catch (error) {
      console.log(error);
    }
  };
  const getAliUser = async () => {
    try {
      const result = await axios.get(
        `/api/users/aliUserInfo?codeAli=${codeAli}`
      );
      const emailAlreadyExist = await axios.get(
        `/api/users/extra/${result.data.userId}@email.com`
      );
      if (!emailAlreadyExist.data) {
        try {
          const res = await register({
            name: '支付宝用户',
            email: result.data.traceId + '@email.com',
            password: '123456',
            icon: result.data.avatar,
          }).unwrap();
          console.log(res);
          dispatch(setCredentials({ ...res }));
        } catch (err) {
          toast.error(err?.data?.message || err.error);
        }
      } else {
        try {
          const res = await login({
            email: result.data.userId + '@email.com',
            password: '123456',
          }).unwrap();
          dispatch(setCredentials({ ...res }));
          if (res.icon !== result.data.avatar) {
            axios
              .patch(`/api/users/icon/${res._id}`, {
                icon: result.data.avatar,
              })
              .then((res) => console.log('updateUserIcon'))
              .catch((err) => toast.error(err?.data?.message || err.error));
          }
        } catch (err) {
          toast.error(err?.data?.message || err.error);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const sendNavigator = async () => {
    await axios.post('/api/users/sendNavigator', {
      environment: navigator.userAgent,
    });
  };
  useEffect(() => {
    let surfModel = navigator.userAgent;
    if (surfModel.toLowerCase().match(/micromessenger/i) == 'micromessenger') {
      // wechatConfig();
      async function middleWare() {
        wechatUser = await getWechatUser();
      }
      if (!userInfo) {
        middleWare();
      }
    } else if (surfModel.toLowerCase().match(/alipay/i) == 'alipay') {
      // if (codeAli) {
      //   async function middleWare01() {
      //     wechatUser = await getAliUser();
      //   }
      //   alert(codeAli);
      //   middleWare01();
      // }
      if (!userInfo) {
        async function middleWare01() {
          wechatUser = await getTaobaoUser();
        }
        middleWare01();
      }
    }
    // wx.checkJsApi({
    //   jsApiList: ['scanQRCode'],
    //   success: function (res) {
    //     wechatConfig();
    //     async function middleWare() {
    //       wechatUser = await getWechatUser();
    //     }
    //     if (!userInfo) {
    //       middleWare();
    //     }
    //   },
    //   error: function (err) {
    //     console.log(err);
    //   },
    // });
  }, [userInfo, codeAli]);
  return isLoading ? (
    <Loader />
  ) : (
    <Pagination className='d-flex '>
      <LinkContainer to='/'>
        <Pagination.Item>全部商品</Pagination.Item>
      </LinkContainer>

      {categories.map((category, index) => (
        <LinkContainer
          key={index}
          to={
            keyword
              ? `/category/${category}/search/${keyword}`
              : `/category/${category}`

            // !(pages > 1)
            //   ? keyword
            //     ? `/category/${category}/search/${keyword}`
            //     : `/category/${category}`
            //   : keyword
            //   ? `/category/${category}/search/${keyword}/page/${page}`
            //   : `/category/${category}/page/${page}`
          }
        >
          <Pagination.Item>{category}</Pagination.Item>
        </LinkContainer>
      ))}
      <Button onClick={scanCode} style={{ display: 'none' }}>
        camera
      </Button>
      <Button onClick={wxpayment} style={{ display: 'none' }}>
        wxpayment
      </Button>
      <Button onClick={getCodeAli} style={{ display: 'none' }}>
        支付宝登录
      </Button>
      <Button onClick={sendNavigator} style={{ display: 'none' }}>
        userAgent
      </Button>
    </Pagination>
  );
};
export default NavbarCategory;
