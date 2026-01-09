const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { auth } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');
const { body } = require('express-validator');

/**
 * @route   POST /api/ai/generate-cover-letter
 * @desc    Generate cover letter using AI
 * @access  Private (candidate)
 */
router.post(
  '/generate-cover-letter',
  auth,
  roleGuard('candidate'),
  body('jobId').isMongoId().withMessage('Invalid job ID'),
  aiController.generateCoverLetter
);

/**
 * @route   POST /api/ai/analyze-match
 * @desc    Analyze candidate-job match using AI
 * @access  Private (recruiter)
 */
router.post(
  '/analyze-match',
  auth,
  roleGuard('recruiter'),
  body('applicationId').isMongoId().withMessage('Invalid application ID'),
  aiController.analyzeMatch
);

module.exports = router;
