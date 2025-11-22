const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');
const validateRequest = require('../middleware/validateRequest');
const {
	signupSchema,
	loginSchema,
	forgotPasswordSchema,
	resetPasswordSchema,
} = require('../validation/authValidation');

router.post('/signup', validateRequest(signupSchema), authController.signup);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), authController.resetPassword);
router.get('/me', authMiddleware, authController.getProfile);

module.exports = router;
