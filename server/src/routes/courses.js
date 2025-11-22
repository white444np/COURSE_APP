const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const courseController = require('../controllers/courseController');
const validateRequest = require('../middleware/validateRequest');
const {
	createCourseSchema,
	updateCourseSchema,
	courseIdParams,
} = require('../validation/courseValidation');

router.get('/', courseController.getPublicCourses);
router.get('/:id', validateRequest(courseIdParams), courseController.getPublicCourseById);

router.use(authMiddleware, adminMiddleware);

router.post('/', validateRequest(createCourseSchema), courseController.createCourse);
router
	.route('/:id')
	.patch(validateRequest(updateCourseSchema), courseController.updateCourse)
	.delete(validateRequest(courseIdParams), courseController.deleteCourse);

module.exports = router;
