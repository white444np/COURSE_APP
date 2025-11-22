const { z } = require('zod');

const objectIdRegex = /^[a-f\d]{24}$/i;

const orderIdSchema = z.string({ required_error: 'Order identifier is required' }).trim().min(1, 'Order identifier is required');
const paymentIdSchema = z.string({ required_error: 'Payment identifier is required' }).trim().min(1, 'Payment identifier is required');
const signatureSchema = z.string({ required_error: 'Payment signature is required' }).trim().min(1, 'Payment signature is required');

const createOrderSchema = z.object({
	body: z.object({
		courseId: z
			.string({ required_error: 'Course identifier is required' })
			.trim()
			.regex(objectIdRegex, 'Course identifier is invalid'),
	}),
});

const verifyPaymentSchema = z.object({
	body: z.object({
		razorpayOrderId: orderIdSchema,
		razorpayPaymentId: paymentIdSchema,
		razorpaySignature: signatureSchema,
	}),
});

module.exports = {
	createOrderSchema,
	verifyPaymentSchema,
};
