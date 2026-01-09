const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { auth } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');
const { uploadLogo, handleUploadError } = require('../middleware/upload');
const { stringRules, urlRules, objectIdRules, paginationRules } = require('../utils/validators');

// Company validation rules
const companyValidation = [
  stringRules('name', { required: true, max: 100 }),
  stringRules('description', { required: false, max: 2000 }),
  stringRules('logo', { required: false, max: 500 }),
  urlRules('website'),
  stringRules('location', { required: false, max: 200 }),
];

const companyUpdateValidation = [
  stringRules('name', { required: false, max: 100 }),
  stringRules('description', { required: false, max: 2000 }),
  stringRules('logo', { required: false, max: 500 }),
  urlRules('website'),
  stringRules('location', { required: false, max: 200 }),
];

/**
 * @route   GET /api/companies
 * @desc    Get all companies
 * @access  Private
 */
router.get('/', auth, paginationRules(), companyController.getAllCompanies);

/**
 * @route   GET /api/companies/my
 * @desc    Get my companies (recruiter)
 * @access  Private (recruiter)
 */
router.get('/my', auth, roleGuard('recruiter'), companyController.getMyCompanies);

/**
 * @route   GET /api/companies/:id
 * @desc    Get company by ID
 * @access  Private
 */
router.get('/:id', auth, objectIdRules('id'), companyController.getCompany);

/**
 * @route   POST /api/companies
 * @desc    Create a new company
 * @access  Private (recruiter)
 */
router.post('/', auth, roleGuard('recruiter'), companyValidation, companyController.createCompany);

/**
 * @route   PUT /api/companies/:id
 * @desc    Update company
 * @access  Private (recruiter - owner only)
 */
router.put(
  '/:id',
  auth,
  roleGuard('recruiter'),
  objectIdRules('id'),
  companyUpdateValidation,
  companyController.updateCompany
);

/**
 * @route   DELETE /api/companies/:id
 * @desc    Delete company
 * @access  Private (recruiter - owner only)
 */
router.delete('/:id', auth, roleGuard('recruiter'), objectIdRules('id'), companyController.deleteCompany);

/**
 * @route   POST /api/companies/:id/logo
 * @desc    Upload company logo
 * @access  Private (recruiter - owner only)
 */
router.post(
  '/:id/logo',
  auth,
  roleGuard('recruiter'),
  objectIdRules('id'),
  uploadLogo.single('logo'),
  handleUploadError,
  companyController.uploadLogo
);

/**
 * @route   DELETE /api/companies/:id/logo
 * @desc    Delete company logo
 * @access  Private (recruiter - owner only)
 */
router.delete('/:id/logo', auth, roleGuard('recruiter'), objectIdRules('id'), companyController.deleteLogo);

module.exports = router;
