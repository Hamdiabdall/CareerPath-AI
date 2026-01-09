const { JobOffer, Company, Application } = require('../models');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

/**
 * Create a new job offer
 * @param {string} recruiterId - Recruiter user ID
 * @param {Object} data - Job data
 * @returns {Promise<Object>} Created job
 */
const createJob = async (recruiterId, data) => {
  // Verify recruiter owns the company
  const company = await Company.findById(data.companyId);
  if (!company) {
    throw new NotFoundError('Company not found');
  }
  if (company.owner.toString() !== recruiterId.toString()) {
    throw new ForbiddenError('You can only create jobs for your own company');
  }

  const job = await JobOffer.create({
    title: data.title,
    description: data.description,
    salary: data.salary,
    contractType: data.contractType,
    deadline: data.deadline,
    company: data.companyId,
    skills: data.skills || [],
  });

  return job.populate([
    { path: 'company', populate: { path: 'owner', select: '-password' } },
    { path: 'skills' },
  ]);
};

/**
 * Update job offer
 * @param {string} jobId - Job ID
 * @param {string} recruiterId - Recruiter user ID
 * @param {Object} data - Data to update
 * @returns {Promise<Object>} Updated job
 */
const updateJob = async (jobId, recruiterId, data) => {
  const job = await JobOffer.findById(jobId).populate('company');

  if (!job) {
    throw new NotFoundError('Job offer not found');
  }

  // Verify ownership
  if (job.company.owner.toString() !== recruiterId.toString()) {
    throw new ForbiddenError('You can only update jobs from your own company');
  }

  // Only allow specific fields to be updated
  const allowedFields = ['title', 'description', 'salary', 'contractType', 'deadline', 'skills'];
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      job[field] = data[field];
    }
  }

  await job.save();
  return job.populate([
    { path: 'company', populate: { path: 'owner', select: '-password' } },
    { path: 'skills' },
  ]);
};

/**
 * Delete job offer and associated applications
 * @param {string} jobId - Job ID
 * @param {string} recruiterId - Recruiter user ID
 * @returns {Promise<Array>} Deleted application IDs (for notifications)
 */
const deleteJob = async (jobId, recruiterId) => {
  const job = await JobOffer.findById(jobId).populate('company');

  if (!job) {
    throw new NotFoundError('Job offer not found');
  }

  // Verify ownership
  if (job.company.owner.toString() !== recruiterId.toString()) {
    throw new ForbiddenError('You can only delete jobs from your own company');
  }

  // Get applications before deleting (for notifications)
  const applications = await Application.find({ job: jobId }).populate('candidate', 'email');
  const affectedCandidates = applications.map((app) => ({
    email: app.candidate.email,
    jobTitle: job.title,
    companyName: job.company.name,
  }));

  // Delete applications
  await Application.deleteMany({ job: jobId });

  // Delete job
  await job.deleteOne();

  return affectedCandidates;
};

/**
 * Search jobs with filters
 * @param {Object} filters - Search filters
 * @param {boolean} excludeExpired - Whether to exclude expired jobs
 * @returns {Promise<Object>} Jobs with pagination
 */
const searchJobs = async (filters = {}, excludeExpired = true) => {
  const { page = 1, limit = 10, skill, contractType, location, search, companyId } = filters;
  const skip = (page - 1) * limit;

  const query = {};

  // Exclude expired jobs for candidates
  if (excludeExpired) {
    query.$or = [{ deadline: { $gte: new Date() } }, { deadline: null }];
  }

  // Filter by skill
  if (skill) {
    query.skills = { $in: Array.isArray(skill) ? skill : [skill] };
  }

  // Filter by contract type
  if (contractType) {
    query.contractType = contractType;
  }

  // Filter by company
  if (companyId) {
    query.company = companyId;
  }

  // Text search
  if (search) {
    query.$text = { $search: search };
  }

  // Filter by location (through company)
  let locationFilter = null;
  if (location) {
    const companiesInLocation = await Company.find({
      location: { $regex: location, $options: 'i' },
    }).select('_id');
    locationFilter = companiesInLocation.map((c) => c._id);
    query.company = { $in: locationFilter };
  }

  const [jobs, total] = await Promise.all([
    JobOffer.find(query)
      .populate([
        { path: 'company', populate: { path: 'owner', select: '-password' } },
        { path: 'skills' },
      ])
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }), // Newest first
    JobOffer.countDocuments(query),
  ]);

  return {
    jobs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get job by ID
 * @param {string} jobId - Job ID
 * @returns {Promise<Object>} Job
 */
const getJobById = async (jobId) => {
  const job = await JobOffer.findById(jobId).populate([
    { path: 'company', populate: { path: 'owner', select: '-password' } },
    { path: 'skills' },
  ]);

  if (!job) {
    throw new NotFoundError('Job offer not found');
  }

  return job;
};

/**
 * Get jobs by company
 * @param {string} companyId - Company ID
 * @returns {Promise<Array>} Jobs
 */
const getJobsByCompany = async (companyId) => {
  const jobs = await JobOffer.find({ company: companyId })
    .populate([{ path: 'company', populate: { path: 'owner', select: '-password' } }, { path: 'skills' }])
    .sort({ createdAt: -1 });

  return jobs;
};

module.exports = {
  createJob,
  updateJob,
  deleteJob,
  searchJobs,
  getJobById,
  getJobsByCompany,
};
