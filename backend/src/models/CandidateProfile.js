const mongoose = require('mongoose');

const candidateProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    unique: true,
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters'],
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters'],
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [2000, 'Bio cannot exceed 2000 characters'],
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters'],
  },
  portfolioLink: {
    type: String,
    trim: true,
    maxlength: [500, 'Portfolio link cannot exceed 500 characters'],
  },
  photo: {
    type: String,
    trim: true,
  },
  cvUrl: {
    type: String,
    trim: true,
  },
  cvText: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Index for faster queries
candidateProfileSchema.index({ user: 1 });

// Virtual for full name
candidateProfileSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.firstName || this.lastName || '';
});

// Ensure virtuals are included in JSON
candidateProfileSchema.set('toJSON', { virtuals: true });
candidateProfileSchema.set('toObject', { virtuals: true });

const CandidateProfile = mongoose.model('CandidateProfile', candidateProfileSchema);

module.exports = CandidateProfile;
