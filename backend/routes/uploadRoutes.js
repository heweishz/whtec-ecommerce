import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { uploadSingleImageController } from '../controllers/imageControlller.js';
const router = express.Router();

router.post('/', protect, uploadSingleImageController);

export default router;
