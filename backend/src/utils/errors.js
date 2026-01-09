/**
 * Custom error classes for CareerPath AI
 */

class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Authentication errors
class AuthError extends AppError {
  constructor(message, code = 'AUTH_ERROR') {
    super(message, 401, code);
  }
}

class InvalidCredentialsError extends AuthError {
  constructor(message = 'Invalid email or password') {
    super(message, 'AUTH_INVALID_CREDENTIALS');
  }
}

class EmailNotVerifiedError extends AuthError {
  constructor(message = 'Email not verified. Please verify your email first.') {
    super(message, 'AUTH_EMAIL_NOT_VERIFIED');
  }
}

class InvalidTokenError extends AuthError {
  constructor(message = 'Invalid or expired token') {
    super(message, 'AUTH_INVALID_TOKEN');
  }
}

class InvalidOTPError extends AppError {
  constructor(message = 'Invalid OTP code') {
    super(message, 400, 'AUTH_INVALID_OTP');
  }
}

class OTPExpiredError extends AppError {
  constructor(message = 'OTP code has expired') {
    super(message, 400, 'AUTH_OTP_EXPIRED');
  }
}

// Authorization errors
class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403, 'AUTH_FORBIDDEN');
  }
}

// Validation errors
class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

// Duplicate errors
class DuplicateEmailError extends AppError {
  constructor(message = 'Email already registered') {
    super(message, 409, 'DUPLICATE_EMAIL');
  }
}

class DuplicateApplicationError extends AppError {
  constructor(message = 'You have already applied to this job') {
    super(message, 409, 'DUPLICATE_APPLICATION');
  }
}

class DuplicateSkillError extends AppError {
  constructor(message = 'Skill name already exists') {
    super(message, 409, 'DUPLICATE_SKILL');
  }
}

// Not found errors
class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

// AI errors
class AIUnavailableError extends AppError {
  constructor(message = 'Service IA indisponible. Veuillez vérifier Ollama.') {
    super(message, 503, 'AI_UNAVAILABLE');
  }
}

class AITimeoutError extends AppError {
  constructor(message = 'AI request timed out. Please try again.') {
    super(message, 504, 'AI_TIMEOUT');
  }
}

class AIParseError extends AppError {
  constructor(message = 'Failed to parse AI response') {
    super(message, 500, 'AI_PARSE_ERROR');
  }
}

// File errors
class FileInvalidTypeError extends AppError {
  constructor(message = 'Invalid file type. Only PDF files are allowed.') {
    super(message, 400, 'FILE_INVALID_TYPE');
  }
}

module.exports = {
  AppError,
  AuthError,
  InvalidCredentialsError,
  EmailNotVerifiedError,
  InvalidTokenError,
  InvalidOTPError,
  OTPExpiredError,
  ForbiddenError,
  ValidationError,
  DuplicateEmailError,
  DuplicateApplicationError,
  DuplicateSkillError,
  NotFoundError,
  AIUnavailableError,
  AITimeoutError,
  AIParseError,
  FileInvalidTypeError,
};
