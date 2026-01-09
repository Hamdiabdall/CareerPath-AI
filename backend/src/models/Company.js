const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  logo: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
    maxlength: [500, 'Website URL cannot exceed 500 characters'],
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters'],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner reference is required'],
  },
}, {
  timestamps: true,
});

// Indexes
companySchema.index({ owner: 1 });
companySchema.index({ name: 'text', description: 'text' });

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
