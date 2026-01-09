const { validationResult } = require('express-validator');
const applicationService = require('../services/applicationService');
const { ValidationError } = require('../utils/errors');

/**
 * @desc    Create a new application
 * @route   POST /api/applications
 * @access  Private (candidate)
 */
const createApplication = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }

    const { jobId, coverLetter } = req.body;
    const application = await applicationService.createApplication(req.userId, jobId, coverLetter);

    res.status(201).json({
      success: true,
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update application status
 * @route   PUT /api/applications/:id/status
 * @access  Private (recruiter)
 */
const updateStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }

    const { status } = req.body;
    const application = await applicationService.updateStatus(req.params.id, req.userId, status);

    res.status(200).json({
      success: true,
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get applications (filtered by role)
 * @route   GET /api/applications
 * @access  Private
 */
const getApplications = async (req, res, next) => {
  try {
    let applications;

    if (req.user.role === 'candidate') {
      // Candidates see their own applications
      applications = await applicationService.getApplicationsByCandidate(req.userId);
    } else if (req.user.role === 'recruiter') {
      // Recruiters see all applications for their company's jobs
      const { jobId } = req.query;
      if (jobId) {
        // Filter by specific job if provided
        applications = await applicationService.getApplicationsByJob(jobId, req.userId);
      } else {
        // Get all applications for recruiter's company
        applications = await applicationService.getApplicationsByRecruiter(req.userId);
      }
    } else {
      applications = [];
    }

    res.status(200).json({
      success: true,
      data: { applications },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get application by ID
 * @route   GET /api/applications/:id
 * @access  Private
 */
const getApplication = async (req, res, next) => {
  try {
    const application = await applicationService.getApplicationById(req.params.id);

    res.status(200).json({
      success: true,
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save AI-generated content
 * @route   PUT /api/applications/:id/ai-content
 * @access  Private (candidate)
 */
const saveAIContent = async (req, res, next) => {
  try {
    const { content } = req.body;
    const application = await applicationService.saveAIContent(req.params.id, req.userId, content);

    res.status(200).json({
      success: true,
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createApplication,
  updateStatus,
  getApplications,
  getApplication,
  saveAIContent,
};
