const { body, param, query } = require('express-validator');

/**
 * Validation rules for CareerPath AI
 */

// Email validation
const emailRules = () => body('email')
  .trim()
  .isEmail()
  .withMessage('Please provide a valid email address')
  .normalizeEmail();

// Password validation (min 8 characters)
const passwordRules = () => body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long');

// Role validation
const roleRules = () => body('role')
  .isIn(['candidate', 'recruiter', 'admin'])
  .withMessage('Role must be candidate, recruiter, or admin');

// OTP validation (6 digits)
const otpRules = () => body('otp')
  .trim()
  .isLength({ min: 6, max: 6 })
  .withMessage('OTP must be exactly 6 digits')
  .isNumeric()
  .withMessage('OTP must contain only numbers');

// MongoDB ObjectId validation
const objectIdRules = (field) => param(field)
  .isMongoId()
  .withMessage(`Invalid ${field} format`);

// Contract type validation
const contractTypeRules = () => body('contractType')
  .optional()
  .isIn(['CDI', 'CDD', 'Freelance', 'Stage'])
  .withMessage('Contract type must be CDI, CDD, Freelance, or Stage');

// Application status validation
const applicationStatusRules = () => body('status')
  .isIn(['pending', 'accepted', 'rejected', 'interview'])
  .withMessage('Status must be pending, accepted, rejected, or interview');

// String field validation
const stringRules = (field, options = {}) => {
  const { min = 1, max = 500, required = true } = options;
  let rule = body(field).trim();
  
  if (!required) {
    rule = rule.optional();
  }
  
  return rule
    .isLength({ min, max })
    .withMessage(`${field} must be between ${min} and ${max} characters`);
};

// URL validation
const urlRules = (field) => body(field)
  .optional()
  .trim()
  .isURL()
  .withMessage(`${field} must be a valid URL`);

// Date validation
const dateRules = (field) => body(field)
  .optional()
  .isISO8601()
  .withMessage(`${field} must be a valid date`);

// Query param validation for pagination
const paginationRules = () => [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

// Auth validation sets
const registerValidation = [
  emailRules(),
  passwordRules(),
  roleRules(),
];

const loginValidation = [
  emailRules(),
  passwordRules(),
];

const verifyOTPValidation = [
  emailRules(),
  otpRules(),
];

const resendOTPValidation = [
  emailRules(),
];

module.exports = {
  emailRules,
  passwordRules,
  roleRules,
  otpRules,
  objectIdRules,
  contractTypeRules,
  applicationStatusRules,
  stringRules,
  urlRules,
  dateRules,
  paginationRules,
  registerValidation,
  loginValidation,
  verifyOTPValidation,
  resendOTPValidation,
};
