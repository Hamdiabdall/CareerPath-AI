const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { auth } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');
const { body } = require('express-validator');
const { objectIdRules, applicationStatusRules, stringRules } = require('../utils/validators');

// Application validation rules
const applicationValidation = [
  body('jobId').isMongoId().withMessage('Invalid job ID'),
  stringRules('coverLetter', { required: false, max: 5000 }),
];

/**
 * @route   GET /api/applications
 * @desc    Get applications (filtered by role)
 * @access  Private
 */
router.get('/', auth, applicationController.getApplications);

/**
 * @route   GET /api/applications/:id
 * @desc    Get application by ID
 * @access  Private
 */
router.get('/:id', auth, objectIdRules('id'), applicationController.getApplication);

/**
 * @route   POST /api/applications
 * @desc    Create a new application
 * @access  Private (candidate)
 */
router.post('/', auth, roleGuard('candidate'), applicationValidation, applicationController.createApplication);

/**
 * @route   PUT /api/applications/:id/status
 * @desc    Update application status
 * @access  Private (recruiter)
 */
router.put(
  '/:id/status',
  auth,
  roleGuard('recruiter'),
  objectIdRules('id'),
  applicationStatusRules(),
  applicationController.updateStatus
);

/**
 * @route   PUT /api/applications/:id/ai-content
 * @desc    Save AI-generated content
 * @access  Private (candidate)
 */
router.put(
  '/:id/ai-content',
  auth,
  roleGuard('candidate'),
  objectIdRules('id'),
  body('content').isString().withMessage('Content must be a string'),
  applicationController.saveAIContent
);

module.exports = router;
