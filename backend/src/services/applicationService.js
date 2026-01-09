const { Application, JobOffer, Company } = require('../models');
const { NotFoundError, ForbiddenError, DuplicateApplicationError } = require('../utils/errors');

/**
 * Create a new application
 * @param {string} candidateId - Candidate user ID
 * @param {string} jobId - Job ID
 * @param {string} coverLetter - Cover letter text
 * @returns {Promise<Object>} Created application
 */
const createApplication = async (candidateId, jobId, coverLetter) => {
  // Verify job exists
  const job = await JobOffer.findById(jobId);
  if (!job) {
    throw new NotFoundError('Job offer not found');
  }

  // Check for existing application
  const existingApplication = await Application.findOne({
    job: jobId,
    candidate: candidateId,
  });

  if (existingApplication) {
    throw new DuplicateApplicationError();
  }

  // Create application
  const application = await Application.create({
    job: jobId,
    candidate: candidateId,
    coverLetter,
    status: 'pending',
    appliedAt: new Date(),
  });

  return application.populate([
    {
      path: 'job',
      populate: [{ path: 'company', populate: { path: 'owner', select: '-password' } }, { path: 'skills' }],
    },
    { path: 'candidate', select: '-password' },
  ]);
};

/**
 * Update application status
 * @param {string} applicationId - Application ID
 * @param {string} recruiterId - Recruiter user ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated application
 */
const updateStatus = async (applicationId, recruiterId, status) => {
  const application = await Application.findById(applicationId).populate({
    path: 'job',
    populate: { path: 'company' },
  });

  if (!application) {
    throw new NotFoundError('Application not found');
  }

  // Verify recruiter owns the job's company
  if (application.job.company.owner.toString() !== recruiterId.toString()) {
    throw new ForbiddenError('You can only update applications for your own job offers');
  }

  // Update only status field
  application.status = status;
  await application.save();

  return application.populate([
    {
      path: 'job',
      populate: [{ path: 'company', populate: { path: 'owner', select: '-password' } }, { path: 'skills' }],
    },
    { path: 'candidate', select: '-password' },
  ]);
};

/**
 * Get applications by candidate
 * @param {string} candidateId - Candidate user ID
 * @returns {Promise<Array>} Applications
 */
const getApplicationsByCandidate = async (candidateId) => {
  const applications = await Application.find({ candidate: candidateId })
    .populate([
      {
        path: 'job',
        populate: [{ path: 'company', populate: { path: 'owner', select: '-password' } }, { path: 'skills' }],
      },
      { path: 'candidate', select: '-password' },
    ])
    .sort({ appliedAt: -1 });

  return applications;
};

/**
 * Get applications by job
 * @param {string} jobId - Job ID
 * @param {string} recruiterId - Recruiter user ID
 * @returns {Promise<Array>} Applications
 */
const getApplicationsByJob = async (jobId, recruiterId) => {
  // Verify job exists and recruiter owns it
  const job = await JobOffer.findById(jobId).populate('company');
  if (!job) {
    throw new NotFoundError('Job offer not found');
  }

  if (job.company.owner.toString() !== recruiterId.toString()) {
    throw new ForbiddenError('You can only view applications for your own job offers');
  }

  const applications = await Application.find({ job: jobId })
    .populate([
      {
        path: 'job',
        populate: [{ path: 'company', populate: { path: 'owner', select: '-password' } }, { path: 'skills' }],
      },
      { path: 'candidate', select: '-password' },
    ])
    .sort({ appliedAt: -1 });

  return applications;
};

/**
 * Get all applications for recruiter's company jobs
 * @param {string} recruiterId - Recruiter user ID
 * @returns {Promise<Array>} Applications
 */
const getApplicationsByRecruiter = async (recruiterId) => {
  // Find recruiter's company
  const company = await Company.findOne({ owner: recruiterId });
  if (!company) {
    return [];
  }

  // Find all jobs for this company
  const jobs = await JobOffer.find({ company: company._id });
  const jobIds = jobs.map((j) => j._id);

  // Find all applications for these jobs
  const applications = await Application.find({ job: { $in: jobIds } })
    .populate([
      {
        path: 'job',
        populate: [{ path: 'company', populate: { path: 'owner', select: '-password' } }, { path: 'skills' }],
      },
      {
        path: 'candidate',
        select: '-password',
      },
    ])
    .sort({ appliedAt: -1 })
    .lean();

  // Manually populate candidate profiles
  const CandidateProfile = require('../models/CandidateProfile');
  for (const app of applications) {
    if (app.candidate) {
      const profile = await CandidateProfile.findOne({ user: app.candidate._id }).lean();
      if (profile) {
        app.candidate.profile = profile;
      }
    }
  }

  return applications;
};

/**
 * Save AI-generated content
 * @param {string} applicationId - Application ID
 * @param {string} candidateId - Candidate user ID
 * @param {string} content - AI-generated content
 * @returns {Promise<Object>} Updated application
 */
const saveAIContent = async (applicationId, candidateId, content) => {
  const application = await Application.findById(applicationId);

  if (!application) {
    throw new NotFoundError('Application not found');
  }

  // Verify candidate owns the application
  if (application.candidate.toString() !== candidateId.toString()) {
    throw new ForbiddenError('You can only update your own applications');
  }

  application.aiGeneratedContent = content;
  await application.save();

  return application.populate([
    {
      path: 'job',
      populate: [{ path: 'company', populate: { path: 'owner', select: '-password' } }, { path: 'skills' }],
    },
    { path: 'candidate', select: '-password' },
  ]);
};

/**
 * Update match score
 * @param {string} applicationId - Application ID
 * @param {number} score - Match score (0-100)
 * @param {string} justification - Score justification
 * @returns {Promise<Object>} Updated application
 */
const updateMatchScore = async (applicationId, score, justification) => {
  const application = await Application.findByIdAndUpdate(
    applicationId,
    {
      matchScore: score,
      matchJustification: justification,
    },
    { new: true }
  ).populate([
    {
      path: 'job',
      populate: [{ path: 'company', populate: { path: 'owner', select: '-password' } }, { path: 'skills' }],
    },
    { path: 'candidate', select: '-password' },
  ]);

  if (!application) {
    throw new NotFoundError('Application not found');
  }

  return application;
};

/**
 * Get application by ID
 * @param {string} applicationId - Application ID
 * @returns {Promise<Object>} Application
 */
const getApplicationById = async (applicationId) => {
  const application = await Application.findById(applicationId).populate([
    {
      path: 'job',
      populate: [{ path: 'company', populate: { path: 'owner', select: '-password' } }, { path: 'skills' }],
    },
    { path: 'candidate', select: '-password' },
  ]);

  if (!application) {
    throw new NotFoundError('Application not found');
  }

  return application;
};

module.exports = {
  createApplication,
  updateStatus,
  getApplicationsByCandidate,
  getApplicationsByJob,
  getApplicationsByRecruiter,
  saveAIContent,
  updateMatchScore,
  getApplicationById,
};
