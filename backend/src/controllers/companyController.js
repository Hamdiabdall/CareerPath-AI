const { validationResult } = require('express-validator');
const companyService = require('../services/companyService');
const { ValidationError } = require('../utils/errors');

/**
 * @desc    Create a new company
 * @route   POST /api/companies
 * @access  Private (recruiter)
 */
const createCompany = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }

    const company = await companyService.createCompany(req.userId, req.body);

    res.status(201).json({
      success: true,
      data: { company },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update company
 * @route   PUT /api/companies/:id
 * @access  Private (recruiter - owner only)
 */
const updateCompany = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }

    const company = await companyService.updateCompany(req.params.id, req.userId, req.body);

    res.status(200).json({
      success: true,
      data: { company },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get company by ID
 * @route   GET /api/companies/:id
 * @access  Private
 */
const getCompany = async (req, res, next) => {
  try {
    const company = await companyService.getCompany(req.params.id);

    res.status(200).json({
      success: true,
      data: { company },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all companies
 * @route   GET /api/companies
 * @access  Private
 */
const getAllCompanies = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const result = await companyService.getAllCompanies({
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      search,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get my companies (recruiter)
 * @route   GET /api/companies/my
 * @access  Private (recruiter)
 */
const getMyCompanies = async (req, res, next) => {
  try {
    const companies = await companyService.getCompaniesByOwner(req.userId);

    res.status(200).json({
      success: true,
      data: { companies },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete company
 * @route   DELETE /api/companies/:id
 * @access  Private (recruiter - owner only)
 */
const deleteCompany = async (req, res, next) => {
  try {
    await companyService.deleteCompany(req.params.id, req.userId);

    res.status(200).json({
      success: true,
      message: 'Company deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload company logo
 * @route   POST /api/companies/:id/logo
 * @access  Private (recruiter - owner only)
 */
const uploadLogo = async (req, res, next) => {
  try {
    const company = await companyService.uploadLogo(req.params.id, req.userId, req.file);

    res.status(200).json({
      success: true,
      data: { company },
      message: 'Logo uploaded successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete company logo
 * @route   DELETE /api/companies/:id/logo
 * @access  Private (recruiter - owner only)
 */
const deleteLogo = async (req, res, next) => {
  try {
    const company = await companyService.deleteLogo(req.params.id, req.userId);

    res.status(200).json({
      success: true,
      data: { company },
      message: 'Logo deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCompany,
  updateCompany,
  getCompany,
  getAllCompanies,
  getMyCompanies,
  deleteCompany,
  uploadLogo,
  deleteLogo,
};
