const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { auth } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');
const { objectIdRules } = require('../utils/validators');

/**
 * @route   GET /api/wishlist
 * @desc    Get user's wishlist
 * @access  Private (candidate)
 */
router.get('/', auth, roleGuard('candidate'), wishlistController.getWishlist);

/**
 * @route   GET /api/wishlist/check/:jobId
 * @desc    Check if job is in wishlist
 * @access  Private (candidate)
 */
router.get('/check/:jobId', auth, roleGuard('candidate'), objectIdRules('jobId'), wishlistController.checkWishlist);

/**
 * @route   POST /api/wishlist/:jobId
 * @desc    Add job to wishlist
 * @access  Private (candidate)
 */
router.post('/:jobId', auth, roleGuard('candidate'), objectIdRules('jobId'), wishlistController.addToWishlist);

/**
 * @route   DELETE /api/wishlist/:jobId
 * @desc    Remove job from wishlist
 * @access  Private (candidate)
 */
router.delete('/:jobId', auth, roleGuard('candidate'), objectIdRules('jobId'), wishlistController.removeFromWishlist);

module.exports = router;
