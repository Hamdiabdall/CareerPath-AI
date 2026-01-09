const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { auth } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');
const { uploadCV, uploadPhoto, handleUploadError } = require('../middleware/upload');
const { stringRules, urlRules, objectIdRules } = require('../utils/validators');

// Profile validation rules
const profileValidation = [
  stringRules('firstName', { required: false, max: 50 }),
  stringRules('lastName', { required: false, max: 50 }),
  stringRules('bio', { required: false, max: 2000 }),
  stringRules('phone', { required: false, max: 20 }),
  urlRules('portfolioLink'),
];

/**
 * @route   GET /api/profile
 * @desc    Get current user's profile
 * @access  Private (candidate)
 */
router.get('/', auth, roleGuard('candidate'), profileController.getProfile);

/**
 * @route   PUT /api/profile
 * @desc    Update current user's profile
 * @access  Private (candidate)
 */
router.put('/', auth, roleGuard('candidate'), profileValidation, profileController.updateProfile);

/**
 * @route   POST /api/profile/cv
 * @desc    Upload CV PDF
 * @access  Private (candidate)
 */
router.post(
  '/cv',
  auth,
  roleGuard('candidate'),
  uploadCV.single('cv'),
  handleUploadError,
  profileController.uploadCV
);

/**
 * @route   DELETE /api/profile/cv
 * @desc    Delete CV
 * @access  Private (candidate)
 */
router.delete('/cv', auth, roleGuard('candidate'), profileController.deleteCV);

/**
 * @route   POST /api/profile/photo
 * @desc    Upload profile photo
 * @access  Private (candidate)
 */
router.post(
  '/photo',
  auth,
  roleGuard('candidate'),
  uploadPhoto.single('photo'),
  handleUploadError,
  profileController.uploadPhoto
);

/**
 * @route   DELETE /api/profile/photo
 * @desc    Delete profile photo
 * @access  Private (candidate)
 */
router.delete('/photo', auth, roleGuard('candidate'), profileController.deletePhoto);

/**
 * @route   GET /api/profile/:id
 * @desc    Get profile by ID (for recruiters viewing candidates)
 * @access  Private
 */
router.get('/:id', auth, objectIdRules('id'), profileController.getProfileById);

module.exports = router;
