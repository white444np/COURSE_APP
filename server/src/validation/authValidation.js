const { z } = require('zod');

const emailSchema = z
	.string({ required_error: 'Email is required' })
	.trim()
	.min(1, 'Email is required')
	.email('Provide a valid email address');

const passwordSchema = z
	.string({ required_error: 'Password is required' })
	.min(8, 'Password must be at least 8 characters long')
	.max(128, 'Password must be 128 characters or fewer')
	.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, 'Password must include upper, lower, number, and symbol');

const optionalPasswordSchema = z
	.string({ required_error: 'Password is required' })
	.min(6, 'Password must be at least 6 characters long')
	.max(128, 'Password must be 128 characters or fewer');

const signupSchema = z.object({
	body: z.object({
		name: z.string({ required_error: 'Name is required' }).trim().min(2, 'Name must be at least 2 characters').max(80, 'Name must be at most 80 characters'),
		email: emailSchema,
		password: passwordSchema,
	}),
});

const loginSchema = z.object({
	body: z.object({
		email: emailSchema,
		password: optionalPasswordSchema,
	}),
});

const forgotPasswordSchema = z.object({
	body: z.object({
		email: emailSchema,
	}),
});

const resetPasswordSchema = z.object({
	body: z.object({
		token: z.string({ required_error: 'Reset token is required' }).trim().min(1, 'Reset token is required'),
		password: passwordSchema,
	}),
});

module.exports = {
	signupSchema,
	loginSchema,
	forgotPasswordSchema,
	resetPasswordSchema,
};
