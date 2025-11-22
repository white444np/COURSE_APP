const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [120, 'Course title must be at most 120 characters'],
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Course category is required'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Course price is required'],
    min: [0, 'Course price cannot be negative'],
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

module.exports = mongoose.model('Course', courseSchema);
