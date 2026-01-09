const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { FileInvalidTypeError } = require('../utils/errors');
const { MAX_FILE_SIZE, MAX_IMAGE_SIZE, UPLOAD_DIR } = require('../config/constants');

// Ensure upload directories exist
const uploadDir = path.join(process.cwd(), UPLOAD_DIR);
const cvDir = path.join(uploadDir, 'cv');
const photosDir = path.join(uploadDir, 'photos');
const logosDir = path.join(uploadDir, 'logos');

[uploadDir, cvDir, photosDir, logosDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage for CV
const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, cvDir);
  },
  filename: (req, file, cb) => {
    const userId = req.userId || 'unknown';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const safeName = file.originalname
      .replace(ext, '')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 50);
    cb(null, `${userId}_${timestamp}_${safeName}${ext}`);
  },
});

// Configure storage for profile photos
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, photosDir);
  },
  filename: (req, file, cb) => {
    const userId = req.userId || 'unknown';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `profile_${userId}_${timestamp}${ext}`);
  },
});

// Configure storage for company logos
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, logosDir);
  },
  filename: (req, file, cb) => {
    const companyId = req.params.id || 'unknown';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `logo_${companyId}_${timestamp}${ext}`);
  },
});

// Helper to get relative path for storage
const getRelativePath = (absolutePath) => {
  return absolutePath.replace(process.cwd() + path.sep, '');
};

// File filter for PDF only
const pdfFileFilter = (req, file, cb) => {
  if (file.mimetype !== 'application/pdf') {
    return cb(new FileInvalidTypeError('Only PDF files are allowed'), false);
  }
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.pdf') {
    return cb(new FileInvalidTypeError('Only PDF files are allowed'), false);
  }
  cb(null, true);
};

// File filter for images only
const imageFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new FileInvalidTypeError('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
  }

  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExts.includes(ext)) {
    return cb(new FileInvalidTypeError('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
  }

  cb(null, true);
};

// Multer upload instance for CV
const uploadCV = multer({
  storage: cvStorage,
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

// Multer upload instance for profile photo
const uploadPhoto = multer({
  storage: photoStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
});

// Multer upload instance for company logo
const uploadLogo = multer({
  storage: logoStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
});

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: `File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        },
      });
    }
    return res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: err.message,
      },
    });
  }

  if (err instanceof FileInvalidTypeError) {
    return res.status(400).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  next(err);
};

module.exports = {
  uploadCV,
  uploadPhoto,
  uploadLogo,
  handleUploadError,
  uploadDir,
  cvDir,
  photosDir,
  logosDir,
  getRelativePath,
};
