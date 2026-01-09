const wishlistService = require('../services/wishlistService');

/**
 * @desc    Get user's wishlist
 * @route   GET /api/wishlist
 * @access  Private (candidate)
 */
const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await wishlistService.getWishlist(req.userId);

    res.status(200).json({
      success: true,
      data: { wishlist },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add job to wishlist
 * @route   POST /api/wishlist/:jobId
 * @access  Private (candidate)
 */
const addToWishlist = async (req, res, next) => {
  try {
    const wishlist = await wishlistService.addToWishlist(req.userId, req.params.jobId);

    res.status(200).json({
      success: true,
      data: { wishlist },
      message: 'Job added to wishlist',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove job from wishlist
 * @route   DELETE /api/wishlist/:jobId
 * @access  Private (candidate)
 */
const removeFromWishlist = async (req, res, next) => {
  try {
    const wishlist = await wishlistService.removeFromWishlist(req.userId, req.params.jobId);

    res.status(200).json({
      success: true,
      data: { wishlist },
      message: 'Job removed from wishlist',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check if job is in wishlist
 * @route   GET /api/wishlist/check/:jobId
 * @access  Private (candidate)
 */
const checkWishlist = async (req, res, next) => {
  try {
    const isInWishlist = await wishlistService.isInWishlist(req.userId, req.params.jobId);

    res.status(200).json({
      success: true,
      data: { isInWishlist },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
};
