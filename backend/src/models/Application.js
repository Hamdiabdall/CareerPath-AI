const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobOffer',
    required: [true, 'Job reference is required'],
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Candidate reference is required'],
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'interview'],
    default: 'pending',
  },
  coverLetter: {
    type: String,
    trim: true,
    maxlength: [5000, 'Cover letter cannot exceed 5000 characters'],
  },
  aiGeneratedContent: {
    type: String,
    trim: true,
  },
  matchScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  matchJustification: {
    type: String,
    trim: true,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound unique index to prevent duplicate applications
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

// Other indexes
applicationSchema.index({ candidate: 1 });
applicationSchema.index({ job: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ appliedAt: -1 });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
