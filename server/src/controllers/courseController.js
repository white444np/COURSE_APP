const courseService = require('../services/courseService');

async function getPublicCourses(req, res, next) {
  try {
    const { results, pagination } = await courseService.getCourses(req.query);
    return res.json({ courses: results, pagination });
  } catch (error) {
    return next(error);
  }
}

async function getPublicCourseById(req, res, next) {
  try {
    const course = await courseService.getCourseById(req.params.id);
    return res.json({ course });
  } catch (error) {
    return next(error);
  }
}

async function createCourse(req, res, next) {
  try {
    const course = await courseService.createCourse(req.body);
    return res.status(201).json({ message: 'Course created successfully', course });
  } catch (error) {
    return next(error);
  }
}

async function getAllCourses(req, res, next) {
  try {
    const { results, pagination } = await courseService.getCourses(req.query);
    return res.json({ courses: results, pagination });
  } catch (error) {
    return next(error);
  }
}

async function getCourseById(req, res, next) {
  return getPublicCourseById(req, res, next);
}

async function updateCourse(req, res, next) {
  try {
    const course = await courseService.updateCourse(req.params.id, req.body);
    return res.json({ message: 'Course updated successfully', course });
  } catch (error) {
    return next(error);
  }
}

async function deleteCourse(req, res, next) {
  try {
    await courseService.deleteCourse(req.params.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getPublicCourses,
  getPublicCourseById,
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};
