const bcrypt = require('bcryptjs');

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const SALT_ROUNDS = 10;

/**
 * Generate a random 6-digit OTP code
 * @returns {string} 6-digit OTP code
 */
const generateOTP = () => {
  const min = Math.pow(10, OTP_LENGTH - 1);
  const max = Math.pow(10, OTP_LENGTH) - 1;
  const otp = Math.floor(min + Math.random() * (max - min + 1));
  return otp.toString();
};

/**
 * Hash an OTP code using bcrypt
 * @param {string} otp - Plain OTP code
 * @returns {Promise<string>} Hashed OTP
 */
const hashOTP = async (otp) => {
  return bcrypt.hash(otp, SALT_ROUNDS);
};

/**
 * Verify an OTP code against its hash
 * @param {string} otp - Plain OTP code
 * @param {string} hash - Hashed OTP
 * @returns {Promise<boolean>} True if OTP matches
 */
const verifyOTP = async (otp, hash) => {
  return bcrypt.compare(otp, hash);
};

/**
 * Calculate OTP expiration date
 * @returns {Date} Expiration date (10 minutes from now)
 */
const getOTPExpiry = () => {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
};

/**
 * Check if OTP has expired
 * @param {Date} expiresAt - OTP expiration date
 * @returns {boolean} True if expired
 */
const isOTPExpired = (expiresAt) => {
  return new Date() > new Date(expiresAt);
};

/**
 * Validate OTP format (6 digits)
 * @param {string} otp - OTP code to validate
 * @returns {boolean} True if valid format
 */
const isValidOTPFormat = (otp) => {
  return /^\d{6}$/.test(otp);
};

module.exports = {
  OTP_LENGTH,
  OTP_EXPIRY_MINUTES,
  generateOTP,
  hashOTP,
  verifyOTP,
  getOTPExpiry,
  isOTPExpired,
  isValidOTPFormat,
};
