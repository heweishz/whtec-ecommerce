import express from 'express';
import {
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
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(registerUser).get(protect, admin, getUsers);
router.post('/auth', authUser);
router.get('/aliLogin', aliLogin);
router.get('/aliUserInfo', aliUserInfo);
router.post('/sendNavigator', sendNavigator);
router.post('/logout', logoutUser);
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router
  .route('/:id')
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser);
router.route('/icon/:id').patch(updateUserIcon);
router.route('/name/:id').patch(updateUserName);
router.route('/extra/:email').get(veryfyUseremail);

export default router;
