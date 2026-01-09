const { validationResult } = require('express-validator');
const profileService = require('../services/profileService');
const { ValidationError } = require('../utils/errors');

/**
 * @desc    Get current user's profile
 * @route   GET /api/profile
 * @access  Private (candidate)
 */
const getProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getProfile(req.userId);

    res.status(200).json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current user's profile
 * @route   PUT /api/profile
 * @access  Private (candidate)
 */
const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }

    const profile = await profileService.updateProfile(req.userId, req.body);

    res.status(200).json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload CV PDF
 * @route   POST /api/profile/cv
 * @access  Private (candidate)
 */
const uploadCV = async (req, res, next) => {
  try {
    const profile = await profileService.uploadCV(req.userId, req.file);

    res.status(200).json({
      success: true,
      data: { profile },
      message: 'CV uploaded successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete CV
 * @route   DELETE /api/profile/cv
 * @access  Private (candidate)
 */
const deleteCV = async (req, res, next) => {
  try {
    const profile = await profileService.deleteCV(req.userId);

    res.status(200).json({
      success: true,
      data: { profile },
      message: 'CV deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get profile by ID (for recruiters)
 * @route   GET /api/profile/:id
 * @access  Private
 */
const getProfileById = async (req, res, next) => {
  try {
    const profile = await profileService.getProfileById(req.params.id);

    res.status(200).json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload profile photo
 * @route   POST /api/profile/photo
 * @access  Private (candidate)
 */
const uploadPhoto = async (req, res, next) => {
  try {
    const profile = await profileService.uploadPhoto(req.userId, req.file);

    res.status(200).json({
      success: true,
      data: { profile },
      message: 'Photo uploaded successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete profile photo
 * @route   DELETE /api/profile/photo
 * @access  Private (candidate)
 */
const deletePhoto = async (req, res, next) => {
  try {
    const profile = await profileService.deletePhoto(req.userId);

    res.status(200).json({
      success: true,
      data: { profile },
      message: 'Photo deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadCV,
  deleteCV,
  getProfileById,
  uploadPhoto,
  deletePhoto,
};
