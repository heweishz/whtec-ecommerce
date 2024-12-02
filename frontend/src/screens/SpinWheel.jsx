import React, { useState, useRef, useEffect } from 'react';
import { LuckyWheel } from '@lucky-canvas/react';
import { Button } from 'react-bootstrap';
import { useGetProductDetailsQuery } from '../slices/productsApiSlice';
import {
  useCreateOrderMutation,
  useWxGetOrderMutation,
  usePayMethodMutation,
  useRouletteMutation,
} from '../slices/ordersApiSlice';
import { addOneToCart, clearCartItems } from '../slices/cartSlice';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { savePaymentMethod } from '../slices/cartSlice';
import axios from 'axios';
import wx from 'weixin-js-sdk';
import craftBeer from '../assets/craftBeer.webp';
export default function SpinWheel() {
  const [isOnStartEnabled, setIsOnStartEnabled] = useState(false);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [blocks] = useState([{ padding: '10px', background: '#869cfa' }]);
  const [prizes] = useState([
    { background: '#b8c5f2', fonts: [{ text: '德式小麦' }] },
    { background: '#e9e8fe', fonts: [{ text: '世涛' }] },
    { background: '#b8c5f2', fonts: [{ text: '茉莉鸡尾酒' }] },
    { background: '#e9e8fe', fonts: [{ text: '气泡水' }] },
    { background: '#b8c5f2', fonts: [{ text: '浑浊ipa' }] },
    { background: '#e9e8fe', fonts: [{ text: '双倍ipa' }] },
    { background: '#b8c5f2', fonts: [{ text: '西海岸ipa' }] },
    { background: '#b8c5f2', fonts: [{ text: '鸭屎香柠檬西打' }] },
    { background: '#e9e8fe', fonts: [{ text: '皮尔森' }] },
  ]);
  const [buttons, setButtons] = useState([
    { radius: '40%', background: '#617df2' },
    { radius: '35%', background: '#afc8ff' },
    {
      radius: '30%',
      background: '#869cfa',
      pointer: true,
      fonts: [{ text: isOnStartEnabled ? '开始' : 'wait', top: '-10px' }],
    },
  ]);
  const [resultSpinWheel, setResultSpinWheel] = useState('');
  const myLucky = useRef();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const [createOrder, { createOrderIsLoading, createOrderError }] =
    useCreateOrderMutation();
  const [wxGetOrder, { isLoading: loadingWxGetOrder }] =
    useWxGetOrderMutation();
  const [payMethod] = usePayMethodMutation();
  const [orderId, setOrderId] = useState('');
  const [roulette] = useRouletteMutation();

  // const productId = '66993c58c4a21a5a84e334ec';
  const productId = '66ad6e7b78ebe32b5e9b9ad3';
  dispatch(savePaymentMethod('uncertain'));
  const {
    data: product,
    isLoading: productIsLoading,
    refetch,
    error: productError,
  } = useGetProductDetailsQuery(productId);

  async function wxPayment(orderId) {
    // dispatch(savePaymentMethod('微信支付'));

    let openid;
    try {
      if (userInfo && userInfo.email) {
        openid = userInfo.email.split('@')[0];
      }
      const { out_trade_no, total_amount, subject, callbackToken } =
        await wxGetOrder({
          orderId,
        }).unwrap();

      const result = (
        await axios.post('https://gzh.whtec.net/payment/prepay', {
          openid,
          money: total_amount,
          subject: `${subject}`,
          out_trade_no,
          hostname: process.env.REACT_APP_HOSTNAME,
          callbackToken,
        })
      ).data;
      await payMethod({ orderId, payment: '微信支付' });
      /* eslint-disable */
      WeixinJSBridge.invoke('getBrandWCPayRequest', result, function (res) {
        if (res.err_msg == 'get_brand_wcpay_request:ok') {
          toast.success(res);
          setIsOnStartEnabled(true);
          setIsButtonClicked(true);
        }
      });
      /* eslint-enable */
    } catch (error) {
      console.log(error, 'invoke payment errer');
    }
  }

  const paymentHandler = async () => {
    dispatch(addOneToCart({ ...product, qty: 1 }));
    let cartEdited = JSON.parse(localStorage.getItem('cart'));
    try {
      const res = await createOrder({
        orderItems: cartEdited.cartItems,
        shippingAddress: cartEdited.shippingAddress
          ? cartEdited.shippingAddress
          : null,
        paymentMethod: cartEdited.paymentMethod,
        itemsPrice: cartEdited.itemsPrice,
        shippingPrice: cartEdited.shippingPrice,
        taxPrice: cartEdited.taxPrice,
        totalPrice: cartEdited.totalPrice,
        tableNumber: localStorage.getItem('tableNumber'),
      }).unwrap();

      dispatch(clearCartItems());
      setOrderId(res._id);
      wxPayment(res._id);
    } catch (err) {
      console.log(err.status);
    }
  };
  const [showOrHide, setShowOrHide] = useState(true);
  let url = encodeURIComponent(window.location.href.split('#')[0]);
  const wechatConfig = async () => {
    await axios.get(`https://gzh.whtec.net/jsapi?url=${url}`).then((result) => {
      wx.config({
        debug: false,
        ...result.data,
        jsApiList: ['scanQRCode'],
      });
      wx.ready(function () {
        wx.checkJsApi({
          jsApiList: ['scanQRCode'],
          success: function (res) {
            localStorage.setItem('wxConfig', 'true');
          },
        });
      });
      wx.error(function (res) {
        console.log(res, '<<if wx.config ERR');
      });
    });
  };
  useEffect(() => {
    let surfModel = navigator.userAgent;
    if (surfModel.toLowerCase().match(/micromessenger/i) == 'micromessenger') {
      setShowOrHide(false);
      wechatConfig();
    }
  }, []);
  useEffect(() => {
    setButtons([
      { radius: '40%', background: '#617df2' },
      { radius: '35%', background: '#afc8ff' },
      {
        radius: '30%',
        background: '#869cfa',
        pointer: true,
        fonts: [{ text: isOnStartEnabled ? '开始' : '请付款', top: '-10px' }],
      },
    ]);
  }, [isOnStartEnabled]);
  const handleStart = () => {
    if (!isOnStartEnabled) return;
    myLucky.current.play();
    setTimeout(() => {
      const index = (Math.random() * 9) >> 0;
      myLucky.current.stop(index);
    }, 2500);
  };
  return (
    <div>
      <LuckyWheel
        ref={myLucky}
        width='300px'
        height='300px'
        blocks={blocks}
        prizes={prizes}
        buttons={buttons}
        onStart={isOnStartEnabled ? handleStart : null}
        onEnd={async (prize) => {
          // 抽奖结束会触发end回调
          // alert('恭喜你抽到 ' + prize.fonts[0].text + ' 号奖品');
          setResultSpinWheel(prize.fonts[0].text);
          await roulette({ orderId, attachment: prize.fonts[0].text });
          setIsOnStartEnabled(!isOnStartEnabled);
        }}
      />
      <Button
        className='btn btn-success'
        onClick={paymentHandler}
        disabled={isButtonClicked}
      >
        微信付款
      </Button>
      {/* <Button onClick={() => setIsOnStartEnabled(!isOnStartEnabled)}>
        {isOnStartEnabled ? 'Disable' : 'Enable'} onStart
      </Button> */}
      {resultSpinWheel && (
        <div>
          <span>{resultSpinWheel}</span>
          <img src={craftBeer} alt='ProShop' width={80} />
        </div>
      )}
    </div>
  );
}
