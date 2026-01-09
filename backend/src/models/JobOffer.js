const mongoose = require('mongoose');

const jobOfferSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters'],
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters'],
  },
  salary: {
    type: String,
    trim: true,
    maxlength: [100, 'Salary cannot exceed 100 characters'],
  },
  contractType: {
    type: String,
    enum: ['CDI', 'CDD', 'Freelance', 'Stage'],
    required: [true, 'Contract type is required'],
  },
  deadline: {
    type: Date,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company reference is required'],
  },
  skills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
jobOfferSchema.index({ company: 1 });
jobOfferSchema.index({ skills: 1 });
jobOfferSchema.index({ contractType: 1 });
jobOfferSchema.index({ deadline: 1 });
jobOfferSchema.index({ createdAt: -1 });
jobOfferSchema.index({ title: 'text', description: 'text' });

// Virtual to check if job is expired
jobOfferSchema.virtual('isExpired').get(function() {
  if (!this.deadline) return false;
  return new Date() > new Date(this.deadline);
});

// Ensure virtuals are included in JSON
jobOfferSchema.set('toJSON', { virtuals: true });
jobOfferSchema.set('toObject', { virtuals: true });

const JobOffer = mongoose.model('JobOffer', jobOfferSchema);

module.exports = JobOffer;
