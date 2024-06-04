// TableGame.js

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';
import TableGameUserIcon from '../components/TableGameUserIcon';
import './TableGame.css'; // Import CSS file for animations and layout
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

import {
  useLoginMutation,
  useRegisterMutation,
  useVerifyEmailQuery,
} from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import wx from 'weixin-js-sdk';
console.log(wx, 'wx object<<');

const socket = io(process.env.REACT_APP_SOCKET_CONNECTION); // Use your actual domain

const TableGame = () => {
  let url = encodeURIComponent(window.location.href.split('#')[0]);
  const [users, setUsers] = useState([]);
  const dispatch = useDispatch();
  const [login, { isLoadingUser }] = useLoginMutation();
  const [register, { isRegisterUser }] = useRegisterMutation();

  const { userInfo } = useSelector((state) => state.auth);
  const location = useLocation();
  const locationURL = new URLSearchParams(location.search);
  const codeWechat = locationURL.get('code');
  const tableNumber = locationURL.get('table');

  const getBaseCode = async () => {
    const result = await axios.get(
      `https://gzh.whtec.net/user/getcode?hostname=${url}`
    );
    window.location.href = result.data;
  };
  const getInteractCode = async () => {
    const result = await axios.get(
      `https://gzh.whtec.net/user/getinteractcode?hostname=${url}`
    );
    window.location.href = result.data;
  };
  let wechatUser;
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

  const wechatConfig = async () => {
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
          title: '桌游计分', // 分享标题
          link: window.location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
          imgUrl: `${window.location.origin}/images/tableGame.png`, // 分享图标
          success: function () {
            // 设置成功
            console.log('updateTimeLineShareData set success');
          },
        });
        wx.updateAppMessageShareData({
          title: '桌游计分', // 分享标题
          desc: '桌面游戏',
          link: window.location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
          imgUrl: `${window.location.origin}/images/tableGame.png`, // 分享图标
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
    socket.on('updateBoard', (updatedUsers) => {
      setUsers(updatedUsers);
    });

    if (userInfo) {
      const { name, icon } = userInfo;
      socket.emit('newUser', { name, icon });
      let surfModel = navigator.userAgent;
      if (
        surfModel.toLowerCase().match(/micromessenger/i) == 'micromessenger'
      ) {
        wechatConfig();
      }
    } else {
      let surfModel = navigator.userAgent;
      if (
        surfModel.toLowerCase().match(/micromessenger/i) == 'micromessenger'
      ) {
        async function middleWare() {
          wechatUser = await getWechatUser();
        }
        middleWare();
        wechatConfig();
      }
    }
    return () => {
      socket.off('updateBoard');
    };
  }, [userInfo]);

  const handleUserClick = (clickedName) => {
    if (userInfo && userInfo.name !== clickedName) {
      socket.emit('updateScore', { clickerName: userInfo.name, clickedName });
    }
  };

  return (
    <div>
      <h4>点击其它玩家送分，注意：当所有玩家退出后将会清空积分</h4>
      <div className='grid-container'>
        {users.map((user, index) => (
          <TableGameUserIcon
            key={index}
            user={user}
            onClick={handleUserClick}
            currentUser={userInfo ? userInfo.name : ''} // Pass current user name
          />
        ))}
      </div>
      <div className='gif-container'>
        <img src='images/miaojiagirl.gif' alt='GIF' className='gif' />{' '}
        {/* Add your GIF here */}
      </div>
    </div>
  );
};

export default TableGame;
