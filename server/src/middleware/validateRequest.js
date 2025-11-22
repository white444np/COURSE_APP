const { ZodError } = require('zod');
const AppError = require('../utils/AppError');

function formatZodError(error) {
	const details = {};
	error.issues.forEach((issue) => {
		const [segment, ...restPath] = issue.path;
		const fieldPath = (restPath.length ? restPath : issue.path).filter((part) => part !== undefined && part !== null);
		const key = fieldPath.join('.') || (typeof segment === 'string' ? segment : 'root');
		if (!details[key]) {
			details[key] = issue.message;
		}
	});

	return details;
}

function validateRequest(schema) {
	return (req, res, next) => {
		try {
			const parsed = schema.parse({
				body: req.body,
				params: req.params,
				query: req.query,
				headers: req.headers,
			});

			if (parsed.body) req.body = parsed.body;
			if (parsed.params) req.params = parsed.params;
			if (parsed.query) req.query = parsed.query;
			if (parsed.headers) req.headers = parsed.headers;
			req.validated = parsed;
			return next();
		} catch (error) {
			if (error instanceof ZodError) {
				const details = formatZodError(error);
				return next(new AppError('Validation failed', 422, details));
			}
			return next(error);
		}
	};
}

module.exports = validateRequest;
