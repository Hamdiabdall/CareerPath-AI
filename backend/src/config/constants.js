/**
 * Application constants
 */

module.exports = {
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  JWT_EXPIRES_IN: '24h',

  // Roles
  ROLES: {
    CANDIDATE: 'candidate',
    RECRUITER: 'recruiter',
    ADMIN: 'admin',
  },

  // Contract types
  CONTRACT_TYPES: ['CDI', 'CDD', 'Freelance', 'Stage'],

  // Application statuses
  APPLICATION_STATUSES: ['pending', 'accepted', 'rejected', 'interview'],

  // Pagination defaults
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,

  // File upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB for PDFs
  MAX_IMAGE_SIZE: 2 * 1024 * 1024, // 2MB for images
  ALLOWED_FILE_TYPES: ['application/pdf'],
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  UPLOAD_DIR: 'uploads',

  // AI
  AI_COVER_LETTER_MAX_WORDS: 250,
  AI_TIMEOUT_MS: 30000,
};
