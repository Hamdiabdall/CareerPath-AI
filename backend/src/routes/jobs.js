const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { auth } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');
const { body } = require('express-validator');
const { stringRules, contractTypeRules, dateRules, objectIdRules, paginationRules } = require('../utils/validators');

// Job validation rules
const jobValidation = [
  stringRules('title', { required: true, max: 150 }),
  stringRules('description', { required: true, max: 5000 }),
  stringRules('salary', { required: false, max: 100 }),
  contractTypeRules(),
  dateRules('deadline'),
  body('companyId').isMongoId().withMessage('Invalid company ID'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('skills.*').optional().isMongoId().withMessage('Invalid skill ID'),
];

const jobUpdateValidation = [
  stringRules('title', { required: false, max: 150 }),
  stringRules('description', { required: false, max: 5000 }),
  stringRules('salary', { required: false, max: 100 }),
  contractTypeRules(),
  dateRules('deadline'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('skills.*').optional().isMongoId().withMessage('Invalid skill ID'),
];

/**
 * @route   GET /api/jobs
 * @desc    Search jobs
 * @access  Private
 */
router.get('/', auth, paginationRules(), jobController.searchJobs);

/**
 * @route   GET /api/jobs/company/:companyId
 * @desc    Get jobs by company
 * @access  Private
 */
router.get('/company/:companyId', auth, objectIdRules('companyId'), jobController.getJobsByCompany);

/**
 * @route   GET /api/jobs/:id
 * @desc    Get job by ID
 * @access  Private
 */
router.get('/:id', auth, objectIdRules('id'), jobController.getJob);

/**
 * @route   POST /api/jobs
 * @desc    Create a new job offer
 * @access  Private (recruiter)
 */
router.post('/', auth, roleGuard('recruiter'), jobValidation, jobController.createJob);

/**
 * @route   PUT /api/jobs/:id
 * @desc    Update job offer
 * @access  Private (recruiter - owner only)
 */
router.put('/:id', auth, roleGuard('recruiter'), objectIdRules('id'), jobUpdateValidation, jobController.updateJob);

/**
 * @route   DELETE /api/jobs/:id
 * @desc    Delete job offer
 * @access  Private (recruiter - owner only)
 */
router.delete('/:id', auth, roleGuard('recruiter'), objectIdRules('id'), jobController.deleteJob);

module.exports = router;
