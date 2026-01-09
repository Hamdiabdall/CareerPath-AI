const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Skill name cannot exceed 50 characters'],
  },
}, {
  timestamps: true,
});

// Index for alphabetical sorting
skillSchema.index({ name: 1 });

const Skill = mongoose.model('Skill', skillSchema);

module.exports = Skill;
