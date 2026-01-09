const { validationResult } = require('express-validator');
const jobService = require('../services/jobService');
const { sendJobDeletedNotification } = require('../services/emailService');
const { ValidationError } = require('../utils/errors');

/**
 * @desc    Create a new job offer
 * @route   POST /api/jobs
 * @access  Private (recruiter)
 */
const createJob = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }

    const job = await jobService.createJob(req.userId, req.body);

    res.status(201).json({
      success: true,
      data: { job },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update job offer
 * @route   PUT /api/jobs/:id
 * @access  Private (recruiter - owner only)
 */
const updateJob = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }

    const job = await jobService.updateJob(req.params.id, req.userId, req.body);

    res.status(200).json({
      success: true,
      data: { job },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete job offer
 * @route   DELETE /api/jobs/:id
 * @access  Private (recruiter - owner only)
 */
const deleteJob = async (req, res, next) => {
  try {
    const affectedCandidates = await jobService.deleteJob(req.params.id, req.userId);

    // Send notifications to affected candidates (async, don't wait)
    for (const candidate of affectedCandidates) {
      sendJobDeletedNotification(candidate.email, candidate.jobTitle, candidate.companyName).catch((err) =>
        console.error('Failed to send notification:', err.message)
      );
    }

    res.status(200).json({
      success: true,
      message: 'Job offer deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search jobs
 * @route   GET /api/jobs
 * @access  Private
 */
const searchJobs = async (req, res, next) => {
  try {
    const { page, limit, skill, contractType, location, search, companyId } = req.query;

    // Candidates see only non-expired jobs
    const excludeExpired = req.user.role === 'candidate';

    const result = await jobService.searchJobs(
      {
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10,
        skill,
        contractType,
        location,
        search,
        companyId,
      },
      excludeExpired
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get job by ID
 * @route   GET /api/jobs/:id
 * @access  Private
 */
const getJob = async (req, res, next) => {
  try {
    const job = await jobService.getJobById(req.params.id);

    res.status(200).json({
      success: true,
      data: { job },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get jobs by company
 * @route   GET /api/jobs/company/:companyId
 * @access  Private
 */
const getJobsByCompany = async (req, res, next) => {
  try {
    const jobs = await jobService.getJobsByCompany(req.params.companyId);

    res.status(200).json({
      success: true,
      data: { jobs },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJob,
  updateJob,
  deleteJob,
  searchJobs,
  getJob,
  getJobsByCompany,
};
