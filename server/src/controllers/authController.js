const config = require('../config/env');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/token');
const authService = require('../services/authService');

const signup = asyncHandler(async (req, res) => {
	const user = await authService.registerUser(req.body);
	const token = signToken({ id: user.id, email: user.email, role: user.role });

	res.status(201).json({
		token,
		user,
	});
});

const login = asyncHandler(async (req, res) => {
	const user = await authService.authenticateUser(req.body);
	const token = signToken({ id: user.id, email: user.email, role: user.role });

	res.json({
		token,
		user,
	});
});

const getProfile = asyncHandler(async (req, res) => {
	const user = await authService.findUserById(req.user.id);
	res.json(user);
});

const forgotPassword = asyncHandler(async (req, res) => {
	const { email } = req.body;
	const { token: resetToken } = await authService.initiatePasswordReset(email);

	const response = {
		message: 'If the email is registered, a reset link has been sent.',
	};

	if (resetToken && config.nodeEnv !== 'production') {
		const baseUrl = config.clientUrl.replace(/\/$/, '');
		response.resetToken = resetToken;
		response.resetUrl = `${baseUrl}/reset-password/${resetToken}`;
	}

	res.json(response);
});

const resetPassword = asyncHandler(async (req, res) => {
	const { token: resetToken, password } = req.body;
	const user = await authService.resetPassword({ token: resetToken, password });
	const token = signToken({ id: user.id, email: user.email, role: user.role });

	res.json({
		message: 'Password updated successfully',
		token,
		user,
	});
});

module.exports = {
	signup,
	login,
	getProfile,
	forgotPassword,
	resetPassword,
};
