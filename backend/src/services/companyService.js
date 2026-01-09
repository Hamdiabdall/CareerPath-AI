const { Company } = require('../models');
const { NotFoundError, ForbiddenError } = require('../utils/errors');
const { getRelativePath } = require('../middleware/upload');

/**
 * Create a new company
 * @param {string} ownerId - Owner user ID
 * @param {Object} data - Company data
 * @returns {Promise<Object>} Created company
 */
const createCompany = async (ownerId, data) => {
  const company = await Company.create({
    ...data,
    owner: ownerId,
  });

  return company.populate('owner', '-password');
};

/**
 * Update company
 * @param {string} companyId - Company ID
 * @param {string} ownerId - Owner user ID (for verification)
 * @param {Object} data - Data to update
 * @returns {Promise<Object>} Updated company
 */
const updateCompany = async (companyId, ownerId, data) => {
  const company = await Company.findById(companyId);

  if (!company) {
    throw new NotFoundError('Company not found');
  }

  // Verify ownership
  if (company.owner.toString() !== ownerId.toString()) {
    throw new ForbiddenError('You can only update your own company');
  }

  // Only allow specific fields to be updated
  const allowedFields = ['name', 'description', 'logo', 'website', 'location'];
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      company[field] = data[field];
    }
  }

  await company.save();
  return company.populate('owner', '-password');
};

/**
 * Get company by ID
 * @param {string} companyId - Company ID
 * @returns {Promise<Object>} Company
 */
const getCompany = async (companyId) => {
  const company = await Company.findById(companyId).populate('owner', '-password');

  if (!company) {
    throw new NotFoundError('Company not found');
  }

  return company;
};

/**
 * Get companies by owner
 * @param {string} ownerId - Owner user ID
 * @returns {Promise<Array>} List of companies
 */
const getCompaniesByOwner = async (ownerId) => {
  const companies = await Company.find({ owner: ownerId }).populate('owner', '-password');
  return companies;
};

/**
 * Get all companies (with pagination)
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Companies with pagination info
 */
const getAllCompanies = async (options = {}) => {
  const { page = 1, limit = 10, search } = options;
  const skip = (page - 1) * limit;

  const query = {};
  if (search) {
    query.$text = { $search: search };
  }

  const [companies, total] = await Promise.all([
    Company.find(query)
      .populate('owner', '-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Company.countDocuments(query),
  ]);

  return {
    companies,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Delete company
 * @param {string} companyId - Company ID
 * @param {string} ownerId - Owner user ID (for verification)
 * @returns {Promise<void>}
 */
const deleteCompany = async (companyId, ownerId) => {
  const company = await Company.findById(companyId);

  if (!company) {
    throw new NotFoundError('Company not found');
  }

  // Verify ownership
  if (company.owner.toString() !== ownerId.toString()) {
    throw new ForbiddenError('You can only delete your own company');
  }

  await company.deleteOne();
};

/**
 * Upload company logo
 * @param {string} companyId - Company ID
 * @param {string} ownerId - Owner user ID (for verification)
 * @param {Object} file - Uploaded file object from multer
 * @returns {Promise<Object>} Updated company
 */
const uploadLogo = async (companyId, ownerId, file) => {
  const company = await Company.findById(companyId);

  if (!company) {
    throw new NotFoundError('Company not found');
  }

  // Verify ownership
  if (company.owner.toString() !== ownerId.toString()) {
    throw new ForbiddenError('You can only update your own company');
  }

  const relativePath = getRelativePath(file.path);
  company.logo = relativePath;
  await company.save();

  return company.populate('owner', '-password');
};

/**
 * Delete company logo
 * @param {string} companyId - Company ID
 * @param {string} ownerId - Owner user ID (for verification)
 * @returns {Promise<Object>} Updated company
 */
const deleteLogo = async (companyId, ownerId) => {
  const company = await Company.findById(companyId);

  if (!company) {
    throw new NotFoundError('Company not found');
  }

  // Verify ownership
  if (company.owner.toString() !== ownerId.toString()) {
    throw new ForbiddenError('You can only update your own company');
  }

  company.logo = undefined;
  await company.save();

  return company.populate('owner', '-password');
};

module.exports = {
  createCompany,
  updateCompany,
  getCompany,
  getCompaniesByOwner,
  getAllCompanies,
  deleteCompany,
  uploadLogo,
  deleteLogo,
};
