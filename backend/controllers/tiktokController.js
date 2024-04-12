import asyncHandler from '../middleware/asyncHandler.js';

// @desc    tiktok test
// @route   POST /api/tiktok/auth
// @access  Public
const tiktok = asyncHandler(async (req, res) => {
  console.log(req.body);
  console.log('first');
  res.json({ message: 'test' });
});

export { tiktok };
