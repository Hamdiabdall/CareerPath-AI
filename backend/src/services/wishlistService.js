const { User, JobOffer } = require('../models');
const { NotFoundError } = require('../utils/errors');

/**
 * Add job to wishlist (no duplicates)
 * @param {string} userId - User ID
 * @param {string} jobId - Job ID
 * @returns {Promise<Array>} Updated wishlist
 */
const addToWishlist = async (userId, jobId) => {
  // Verify job exists
  const job = await JobOffer.findById(jobId);
  if (!job) {
    throw new NotFoundError('Job offer not found');
  }

  // Add to wishlist using $addToSet (prevents duplicates)
  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { wishlist: jobId } },
    { new: true }
  ).populate({
    path: 'wishlist',
    populate: [
      { path: 'company', populate: { path: 'owner', select: '-password' } },
      { path: 'skills' },
    ],
  });

  return user.wishlist;
};

/**
 * Remove job from wishlist
 * @param {string} userId - User ID
 * @param {string} jobId - Job ID
 * @returns {Promise<Array>} Updated wishlist
 */
const removeFromWishlist = async (userId, jobId) => {
  // Remove from wishlist using $pull
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { wishlist: jobId } },
    { new: true }
  ).populate({
    path: 'wishlist',
    populate: [
      { path: 'company', populate: { path: 'owner', select: '-password' } },
      { path: 'skills' },
    ],
  });

  return user.wishlist;
};

/**
 * Get user's wishlist
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Wishlist with populated jobs
 */
const getWishlist = async (userId) => {
  const user = await User.findById(userId).populate({
    path: 'wishlist',
    populate: [
      { path: 'company', populate: { path: 'owner', select: '-password' } },
      { path: 'skills' },
    ],
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user.wishlist;
};

/**
 * Check if job is in wishlist
 * @param {string} userId - User ID
 * @param {string} jobId - Job ID
 * @returns {Promise<boolean>} True if in wishlist
 */
const isInWishlist = async (userId, jobId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user.wishlist.some((id) => id.toString() === jobId.toString());
};

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  isInWishlist,
};
