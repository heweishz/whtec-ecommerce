import path from 'path';
import fs from 'fs';
import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import checkObjectId from '../middleware/checkObjectId.js';
import asyncHandler from '../middleware/asyncHandler.js';
import Product from '../models/productModel.js';

const router = express.Router();

const updateMultipleImage = asyncHandler(async (req, res) => {
  let image = req.body.img;
  const imageAddress = '/uploads/' + image.split('/')[4];
  const product = await Product.findById(req.params.id);
  if (product) {
    const __dirname = path.resolve();
    fs.unlink(path.join(__dirname + imageAddress), (err) => {
      if (err) {
        console.log(err.message);
        // res.status(404).json(new Error('Unable to delete history image'));
      } else {
        const updateProduct = product.imageDesc.filter(
          (image) => image !== imageAddress
        );
        product.imageDesc = updateProduct;
        product.save().then(() => {
          // res.json({ message: 'History product image removed' });
        });
      }
    });
    // let originalImg = imageAddress.replace('comp', '');
    // fs.unlink(path.join(__dirname + originalImg), (err) => {
    //   if (err) {
    //     console.log(err.message);
    //     // res.status(404).json(new Error('Unable to delete history image'));
    //   } else {
    //   }
    // });
    res.json({ message: 'History product image removed' });
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
// router.route('/:id').put(updateMultipleImage);
router.route('/:id').put(protect, admin, checkObjectId, updateMultipleImage);
export default router;
