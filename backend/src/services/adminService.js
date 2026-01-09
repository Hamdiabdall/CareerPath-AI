const User = require('../models/User');
const Company = require('../models/Company');
const JobOffer = require('../models/JobOffer');
const Application = require('../models/Application');
const CandidateProfile = require('../models/CandidateProfile');
const { NotFoundError } = require('../utils/errors');
const { sendJobDeletedNotification } = require('./emailService');

/**
 * Admin Service for CareerPath AI
 */

/**
 * Get all users (excluding password)
 * @returns {Promise<Array>} Users with role and creation date
 */
const getAllUsers = async () => {
  return User.find({})
    .select('-password -otp.code -otp.expiresAt')
    .sort({ createdAt: -1 });
};

/**
 * Notify affected candidates when applications are deleted
 * @param {Array} applicationIds - Array of application IDs
 * @returns {Promise<void>}
 */
const notifyAffectedCandidates = async (applicationIds) => {
  if (!applicationIds || applicationIds.length === 0) return;

  const applications = await Application.find({ _id: { $in: applicationIds } })
    .populate('candidate', 'email')
    .populate({
      path: 'job',
      select: 'title',
      populate: { path: 'company', select: 'name' },
    });

  const notifications = applications.map(async (app) => {
    if (app.candidate?.email && app.job?.title) {
      try {
        await sendJobDeletedNotification(
          app.candidate.email,
          app.job.title,
          app.job.company?.name || 'Entreprise'
        );
      } catch {
        // Log error but don't fail the deletion
        console.error(`Failed to send notification to ${app.candidate.email}`);
      }
    }
  });

  await Promise.allSettled(notifications);
};

/**
 * Delete a recruiter and cascade delete related data
 * @param {string} userId - User ID to delete
 * @returns {Promise<void>}
 */
const deleteRecruiter = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User not found');
  if (user.role !== 'recruiter') throw new NotFoundError('User is not a recruiter');

  // Find all companies owned by this recruiter
  const companies = await Company.find({ owner: userId });
  const companyIds = companies.map((c) => c._id);

  // Find all job offers from these companies
  const jobOffers = await JobOffer.find({ company: { $in: companyIds } });
  const jobIds = jobOffers.map((j) => j._id);

  // Find all applications to these jobs (for notification)
  const applications = await Application.find({ job: { $in: jobIds } });
  const applicationIds = applications.map((a) => a._id);

  // Notify affected candidates
  await notifyAffectedCandidates(applicationIds);

  // Delete in order: Applications -> JobOffers -> Companies -> User
  await Application.deleteMany({ job: { $in: jobIds } });
  await JobOffer.deleteMany({ company: { $in: companyIds } });
  await Company.deleteMany({ owner: userId });
  await User.findByIdAndDelete(userId);
};

/**
 * Delete a candidate and cascade delete related data
 * @param {string} userId - User ID to delete
 * @returns {Promise<void>}
 */
const deleteCandidate = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User not found');
  if (user.role !== 'candidate') throw new NotFoundError('User is not a candidate');

  // Delete in order: Applications -> CandidateProfile -> User
  await Application.deleteMany({ candidate: userId });
  await CandidateProfile.findOneAndDelete({ user: userId });
  await User.findByIdAndDelete(userId);
};

/**
 * Delete a job offer and cascade delete applications (admin override)
 * @param {string} jobId - Job offer ID to delete
 * @returns {Promise<void>}
 */
const deleteJobOffer = async (jobId) => {
  const job = await JobOffer.findById(jobId).populate('company', 'name');
  if (!job) throw new NotFoundError('Job offer not found');

  // Find applications for notification
  const applications = await Application.find({ job: jobId });
  const applicationIds = applications.map((a) => a._id);

  // Notify affected candidates
  await notifyAffectedCandidates(applicationIds);

  // Delete applications and job offer
  await Application.deleteMany({ job: jobId });
  await JobOffer.findByIdAndDelete(jobId);
};

module.exports = {
  getAllUsers,
  deleteRecruiter,
  deleteCandidate,
  deleteJobOffer,
  notifyAffectedCandidates,
};
