const AppError = require('../utils/AppError');
const { verifyToken } = require('../utils/token');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication token missing', 401));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { id, email, role }
    return next();
  } catch (error) {
    return next(new AppError('Invalid or expired token', 401));
  }
}

module.exports = authMiddleware;
    