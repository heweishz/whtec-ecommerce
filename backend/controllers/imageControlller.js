import path from 'path';
import multer from 'multer';
// import sharp from 'sharp';
import asyncHandler from '../middleware/asyncHandler.js';
// @desc    Update main product image
// @route   POST /api/upload
// @access  Private Admin
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
  const filetypes = /jpe?g|png|webp|mp4/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp|video\/mp4/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Images only!'), false);
  }
}

const upload = multer({ storage, fileFilter });
const uploadSingleImage = upload.single('image');

const uploadSingleImageController = asyncHandler((req, res) => {
  let returnValue;
  uploadSingleImage(req, res, function (err) {
    if (err) {
      return res.status(400).send({ message: err.message });
    }
    // sharp(req.file.path)
    //   .resize(640, 480, { fit: 'contain' })
    //   .jpeg({
    //     quality: 80,
    //     chromaSubsampling: '4:4:4',
    //   })
    //   .toFile(
    //     `${req.file.destination}comp${req.file.filename}`,
    //     (err, info) => {}
    //   );
    returnValue = {
      message: 'Image uploaded successfully',
      image: `/${req.file.destination}${req.file.filename}`,
    };
    res.status(200).send(returnValue);
  });
});

export { uploadSingleImageController };
