import express from 'express';
import { tiktok } from '../controllers/tiktokController.js';

const router = express.Router();
router.route('/').post(tiktok);

export default router;
