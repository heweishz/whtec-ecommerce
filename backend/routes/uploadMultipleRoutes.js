import path from 'path';
import express from 'express';
import multer from 'multer';
import { protect, admin } from '../middleware/authMiddleware.js';
import sharp from 'sharp';

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

function fileFilter(req, file, cb) {
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Images only!'), false);
  }
}

const upload = multer({ storage, fileFilter });
const uploadMultipleImage = upload.array('images');
// const uploadSingleImage = upload.single('image');

router.post('/', protect, admin, (req, res) => {
  uploadMultipleImage(req, res, function (err) {
    if (err) {
      return res.status(400).send({ message: err.message });
    }

    const uploadedFiles = req.files;
    // const filePath = uploadedFiles.map((file) => {
    //   return '/' + file.path;
    // });
    const newFilePath = uploadedFiles.map((file) => {
      sharp(file.path)
        .resize(640, 480, { fit: 'contain' })
        .jpeg({
          quality: 80,
          chromaSubsampling: '4:4:4',
        })
        .toFile(`${file.destination}comp${file.filename}`, (err, info) => {
          if (err) {
            console.log(err, '<<err from sharp');
          }
        });
      return `/${file.destination}comp${file.filename}`;
    });

    res.status(200).send({
      message: 'Image uploaded successfully',
      images: newFilePath,
    });
  });
});

export default router;
