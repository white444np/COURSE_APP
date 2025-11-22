const { z } = require('zod');

const objectIdRegex = /^[a-f\d]{24}$/i;

const priceSchema = z.coerce
	.number({ invalid_type_error: 'Price must be a number' })
	.min(0, 'Price cannot be negative')
	.refine((value) => Number.isFinite(value), 'Price must be a valid number');

const courseBaseSchema = {
	title: z.string({ required_error: 'Title is required' }).trim().min(3, 'Title must be at least 3 characters').max(120, 'Title must be at most 120 characters'),
	description: z.string({ required_error: 'Description is required' }).trim().min(20, 'Description must be at least 20 characters'),
	category: z.string({ required_error: 'Category is required' }).trim().min(2, 'Category must be at least 2 characters').max(60, 'Category must be at most 60 characters'),
	price: priceSchema,
};

const courseIdParams = z.object({
	params: z.object({
		id: z
			.string({ required_error: 'Course identifier is required' })
			.trim()
			.regex(objectIdRegex, 'Course identifier is invalid'),
	}),
});

const createCourseSchema = z.object({
	body: z.object(courseBaseSchema),
});

const updateCourseSchema = z.object({
	params: courseIdParams.shape.params,
	body: z
		.object(courseBaseSchema)
		.partial()
		.refine((data) => Object.keys(data).length > 0, {
			message: 'Provide at least one field to update',
		}),
});

module.exports = {
	createCourseSchema,
	updateCourseSchema,
	courseIdParams,
};
