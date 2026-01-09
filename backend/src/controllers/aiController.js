const { validationResult } = require('express-validator');
const aiService = require('../services/aiService');
const applicationService = require('../services/applicationService');
const profileService = require('../services/profileService');
const jobService = require('../services/jobService');
const { ValidationError, NotFoundError, ForbiddenError } = require('../utils/errors');

/**
 * @desc    Generate cover letter using AI
 * @route   POST /api/ai/generate-cover-letter
 * @access  Private (candidate)
 */
const generateCoverLetter = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }

    const { jobId } = req.body;

    // Get candidate profile
    const profile = await profileService.getProfile(req.userId);

    // Get job details
    const job = await jobService.getJobById(jobId);

    // Generate cover letter
    const coverLetter = await aiService.generateCoverLetter(profile, job);

    res.status(200).json({
      success: true,
      data: { coverLetter },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Analyze candidate-job match using AI
 * @route   POST /api/ai/analyze-match
 * @access  Private (recruiter)
 */
const analyzeMatch = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }

    const { applicationId } = req.body;

    // Get application
    const application = await applicationService.getApplicationById(applicationId);

    // Verify recruiter owns the job
    if (application.job.company.owner._id.toString() !== req.userId.toString()) {
      throw new ForbiddenError('You can only analyze applications for your own job offers');
    }

    // Get candidate profile
    const profile = await profileService.getProfile(application.candidate._id);

    // Analyze match
    const { score, justification } = await aiService.analyzeMatch(profile, application.job);

    // Update application with match score
    const updatedApplication = await applicationService.updateMatchScore(applicationId, score, justification);

    res.status(200).json({
      success: true,
      data: {
        score,
        justification,
        application: updatedApplication,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateCoverLetter,
  analyzeMatch,
};
