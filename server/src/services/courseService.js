const mongoose = require('mongoose');
const Course = require('../models/Course');
const AppError = require('../utils/AppError');

function ensureValidId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid course identifier', 400);
  }
}

async function createCourse(payload) {
  const course = await Course.create(payload);
  return course.toObject({ virtuals: true });
}

async function getCourses({ page = 1, limit = 10, category, search, name }) {
  const filters = {};
  if (category) {
    filters.category = { $regex: new RegExp(category.trim(), 'i') };
  }
  const searchTerm = (search || name || '').toString().trim();
  if (searchTerm) {
    filters.title = { $regex: new RegExp(searchTerm, 'i') };
  }

  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const pageSize = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNumber - 1) * pageSize;

  const [results, total] = await Promise.all([
    Course.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean({ virtuals: true }),
    Course.countDocuments(filters),
  ]);

  return {
    results,
    pagination: {
      total,
      page: pageNumber,
      limit: pageSize,
      pages: Math.ceil(total / pageSize) || 1,
    },
  };
}

async function getCourseById(id) {
  ensureValidId(id);
  const course = await Course.findById(id).lean({ virtuals: true });
  if (!course) {
    throw new AppError('Course not found', 404);
  }
  return course;
}

async function updateCourse(id, payload) {
  ensureValidId(id);
  const course = await Course.findByIdAndUpdate(id, payload, { new: true, runValidators: true }).lean({ virtuals: true });
  if (!course) {
    throw new AppError('Course not found', 404);
  }
  return course;
}

async function deleteCourse(id) {
  ensureValidId(id);
  const course = await Course.findByIdAndDelete(id).lean({ virtuals: true });
  if (!course) {
    throw new AppError('Course not found', 404);
  }
  return course;
}

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};
