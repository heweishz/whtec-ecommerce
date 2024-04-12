import asyncHandler from '../middleware/asyncHandler.js';
import generateToken from '../utils/generateToken.js';
import User from '../models/userModel.js';
import { verifyPayPalPayment, checkIfNewTransaction } from '../utils/paypal.js';

import alipaySdk from '../utils/alipay.js';
import axios from 'axios';
// import { verifyPayPalPayment, checkIfNewTransaction } from '../utils/paypal.js';
// import alipaySdk from '../utils/alipay.js';
// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      icon: user.icon,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, icon } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    icon,
  });

  if (user) {
    generateToken(res, user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      icon: user.icon,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.isAdmin) {
      res.status(400);
      throw new Error('Can not delete admin user');
    }
    await User.deleteOne({ _id: user._id });
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});
// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = Boolean(req.body.isAdmin);

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    updateUserIcon when wechatLogin
// @route   PUT /api/users/icon/:id
// @access  public
const updateUserIcon = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  const { icon } = req.body;
  if (user) {
    user.icon = icon;
    await user.save();
    return res.json(user);
  } else res.send(false);
});
// @desc    updateUserName when wechatLogin
// @route   PUT /api/users/name/:id
// @access  public
const updateUserName = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  const { name } = req.body;
  if (user) {
    user.name = name;
    await user.save();
    return res.json(user);
  } else res.send(false);
});

// @desc    verify user email already exist
// @route   GET /api/users/:email
// @access  public
const veryfyUseremail = asyncHandler(async (req, res) => {
  const email = req.params.email;
  const exist = await User.findOne({ email });
  if (exist) return res.send(true);
  res.send(false);
});
// @desc    respond url for detailed userinfo applying
// @route   GET /api/users/aliLogin
// @access  Public
const aliLogin = asyncHandler(async (req, res) => {
  const { hostname } = req.query;
  let url = `https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?app_id=${
    process.env.APPID
  }&scope=auth_user&redirect_uri=${encodeURIComponent(hostname)}`;
  res.send(url);
});
// @desc    alipay get acceccToken and userInfo
// @route   GET /api/users/aliUserInfo
// @access  Public
const aliUserInfo = asyncHandler(async (req, res) => {
  const { codeAli } = req.query;
  console.log(codeAli);
  const result = await alipaySdk.exec('alipay.system.oauth.token', {
    code: codeAli,
    grant_type: 'authorization_code',
  });
  const accessToken = result.accessToken;
  const userid = result.userid;
  const result01 = await alipaySdk.exec('alipay.user.info.share', {
    authToken: accessToken,
  });
  if (result01.code === '10000') {
    const traceId = result01.traceId;
    const avatar = result01.avatar;
    // 后续更新用户信息的逻辑
    // ...
  }
  res.json(result01);
});
// @desc    alipay get acceccToken and userInfo
// @route   GET /api/users/aliUserInfo
// @access  Public
const sendNavigator = asyncHandler(async (req, res) => {
  console.log(req.body.environment);
  res.json({ suceed: true });
});

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  updateUserIcon,
  updateUserName,
  veryfyUseremail,
  aliLogin,
  aliUserInfo,
  sendNavigator,
};
