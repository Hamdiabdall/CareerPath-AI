const { CandidateProfile, User } = require('../models');
const { extractTextFromPDF } = require('../utils/pdfParser');
const { NotFoundError } = require('../utils/errors');
const { getRelativePath } = require('../middleware/upload');

/**
 * Get candidate profile by user ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Profile with user data
 */
const getProfile = async (userId) => {
  let profile = await CandidateProfile.findOne({ user: userId }).populate('user', '-password');

  if (!profile) {
    // Create empty profile if doesn't exist
    profile = await CandidateProfile.create({ user: userId });
    profile = await CandidateProfile.findOne({ user: userId }).populate('user', '-password');
  }

  return profile;
};

/**
 * Update candidate profile
 * @param {string} userId - User ID
 * @param {Object} data - Profile data to update
 * @returns {Promise<Object>} Updated profile
 */
const updateProfile = async (userId, data) => {
  // Only allow specific fields to be updated
  const allowedFields = ['firstName', 'lastName', 'bio', 'phone', 'portfolioLink'];
  const updateData = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }

  // Find and update or create profile
  let profile = await CandidateProfile.findOneAndUpdate(
    { user: userId },
    { $set: updateData },
    { new: true, upsert: true, runValidators: true }
  ).populate('user', '-password');

  return profile;
};

/**
 * Upload and process CV
 * @param {string} userId - User ID
 * @param {Object} file - Uploaded file object from multer
 * @returns {Promise<Object>} Updated profile with CV data
 */
const uploadCV = async (userId, file) => {
  if (!file) {
    throw new NotFoundError('No file uploaded');
  }

  // Extract text from PDF
  const cvText = await extractTextFromPDF(file.path);

  // Get relative path for storage
  const relativePath = getRelativePath(file.path);

  // Update profile with CV info
  const profile = await CandidateProfile.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        cvUrl: relativePath,
        cvText: cvText,
      },
    },
    { new: true, upsert: true, runValidators: true }
  ).populate('user', '-password');

  return profile;
};

/**
 * Delete CV from profile
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated profile
 */
const deleteCV = async (userId) => {
  const profile = await CandidateProfile.findOneAndUpdate(
    { user: userId },
    {
      $unset: {
        cvUrl: 1,
        cvText: 1,
      },
    },
    { new: true }
  ).populate('user', '-password');

  if (!profile) {
    throw new NotFoundError('Profile not found');
  }

  return profile;
};

/**
 * Get profile by ID (for recruiters viewing candidates)
 * @param {string} profileId - Profile ID
 * @returns {Promise<Object>} Profile with user data
 */
const getProfileById = async (profileId) => {
  const profile = await CandidateProfile.findById(profileId).populate('user', '-password');

  if (!profile) {
    throw new NotFoundError('Profile not found');
  }

  return profile;
};

/**
 * Upload profile photo
 * @param {string} userId - User ID
 * @param {Object} file - Uploaded file object from multer
 * @returns {Promise<Object>} Updated profile with photo
 */
const uploadPhoto = async (userId, file) => {
  if (!file) {
    throw new NotFoundError('No file uploaded');
  }

  const relativePath = getRelativePath(file.path);

  const profile = await CandidateProfile.findOneAndUpdate(
    { user: userId },
    { $set: { photo: relativePath } },
    { new: true, upsert: true, runValidators: true }
  ).populate('user', '-password');

  return profile;
};

/**
 * Delete profile photo
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated profile
 */
const deletePhoto = async (userId) => {
  const profile = await CandidateProfile.findOneAndUpdate(
    { user: userId },
    { $unset: { photo: 1 } },
    { new: true }
  ).populate('user', '-password');

  if (!profile) {
    throw new NotFoundError('Profile not found');
  }

  return profile;
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
