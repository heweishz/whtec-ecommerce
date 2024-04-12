import path from 'path';
import fs from 'fs';
import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import checkObjectId from '../middleware/checkObjectId.js';
import asyncHandler from '../middleware/asyncHandler.js';
import Product from '../models/productModel.js';

const router = express.Router();

const deleteImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    if (product.image !== '/images/sample.jpg') {
      const __dirname = path.resolve();
      fs.unlink(path.join(__dirname + product.image), (err) => {
        if (err) {
          console.log(err.message);
          // res.status(404).json(new Error('Unable to delete original image'));
        } else {
          // res.json({ message: 'Original product image removed' });
        }
      });
      let originalImg = product.image.replace('comp', '');
      fs.unlink(path.join(__dirname + originalImg), (err) => {
        if (err) {
          console.log(err.message);
          // res.status(404).json(new Error('Unable to delete original image'));
        } else {
          // res.json({ message: 'Original product image removed' });
        }
      });
      res.json({ message: 'Original product imag' });
    } else res.json({ message: 'no need to delete sample image' });

    // fs.unlink(path.join(__dirname + product.image), (err) => {
    //   if (err) {
    //     console.log(err.message);
    //     res.status(404);
    //     throw new Error('Unable to delete original image');
    //   } else {
    //     res.json({ message: 'Original product image removed' });
    //   }
    // });
    // fs.readFile(
    //   path.join(__dirname + '/uploads/tmp.json'),
    //   (err, fileContent) => {
    //     if (!err) {
    //       console.log(JSON.parse(fileContent));
    //     } else {
    //       console.error(err);
    //     }
    //   }
    // );
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});
router.route('/:id').delete(protect, admin, checkObjectId, deleteImage);
export default router;
