const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { sendOTP } = require('./emailService');
const { generateOTP, hashOTP, verifyOTP, getOTPExpiry, isOTPExpired } = require('../utils/otpUtils');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/constants');
const {
  DuplicateEmailError,
  InvalidCredentialsError,
  EmailNotVerifiedError,
  InvalidOTPError,
  OTPExpiredError,
  NotFoundError,
} = require('../utils/errors');

/**
 * Generate JWT token for user
 * @param {string} userId - User ID
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} role - User role (candidate, recruiter, admin)
 * @returns {Promise<{user: Object, message: string}>}
 */
const register = async (email, password, role) => {
  // Check if email already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new DuplicateEmailError();
  }

  // Generate OTP
  const otpCode = generateOTP();
  const hashedOTP = await hashOTP(otpCode);

  // Create user with unverified status
  const user = await User.create({
    email: email.toLowerCase(),
    password,
    role,
    isVerified: false,
    otp: {
      code: hashedOTP,
      expiresAt: getOTPExpiry(),
    },
  });

  // Send OTP email
  await sendOTP(email, otpCode);

  return {
    user: user.toJSON(),
    message: 'Registration successful. Please check your email for verification code.',
  };
};

/**
 * Verify OTP and activate account
 * @param {string} email - User email
 * @param {string} otpCode - 6-digit OTP code
 * @returns {Promise<{user: Object, token: string}>}
 */
const verifyOTPCode = async (email, otpCode) => {
  // Find user with OTP fields
  const user = await User.findOne({ email: email.toLowerCase() }).select('+otp.code +otp.expiresAt');
  
  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (user.isVerified) {
    throw new InvalidOTPError('Account is already verified');
  }

  if (!user.otp || !user.otp.code) {
    throw new InvalidOTPError('No OTP found. Please request a new one.');
  }

  // Check expiration
  if (isOTPExpired(user.otp.expiresAt)) {
    throw new OTPExpiredError();
  }

  // Verify OTP
  const isValid = await verifyOTP(otpCode, user.otp.code);
  if (!isValid) {
    throw new InvalidOTPError();
  }

  // Activate account
  user.isVerified = true;
  user.otp = undefined;
  await user.save();

  // Generate token
  const token = generateToken(user._id);

  return {
    user: user.toJSON(),
    token,
  };
};

/**
 * Resend OTP code
 * @param {string} email - User email
 * @returns {Promise<{message: string}>}
 */
const resendOTP = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  
  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (user.isVerified) {
    throw new InvalidOTPError('Account is already verified');
  }

  // Generate new OTP
  const otpCode = generateOTP();
  const hashedOTP = await hashOTP(otpCode);

  // Update user with new OTP
  user.otp = {
    code: hashedOTP,
    expiresAt: getOTPExpiry(),
  };
  await user.save();

  // Send OTP email
  await sendOTP(email, otpCode);

  return {
    message: 'New verification code sent to your email.',
  };
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{user: Object, token: string}>}
 */
const login = async (email, password) => {
  // Find user with password field
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  
  if (!user) {
    throw new InvalidCredentialsError();
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new InvalidCredentialsError();
  }

  // Check if verified
  if (!user.isVerified) {
    throw new EmailNotVerifiedError();
  }

  // Generate token
  const token = generateToken(user._id);

  return {
    user: user.toJSON(),
    token,
  };
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Decoded token payload
 */
const verifyToken = async (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  generateToken,
  register,
  verifyOTPCode,
  resendOTP,
  login,
  verifyToken,
};
