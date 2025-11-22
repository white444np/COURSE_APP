const config = require('../config/env');

function errorMiddleware(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.statusCode || 500;
  const isOperational = err.isOperational === true || status < 500;

  if (!isOperational) {
    // eslint-disable-next-line no-console
    console.error('Unexpected error', err);
  }

  const response = {
    status,
    message: err.message || 'Internal server error',
  };

  if (err.details && Object.keys(err.details).length) {
    response.details = err.details;
  }

  if (config.nodeEnv !== 'production') {
    response.stack = err.stack;
    response.debug = {
      method: req.method,
      path: req.originalUrl,
    };
  }

  res.status(status).json(response);
}

module.exports = errorMiddleware;
