const crypto = require('crypto');
const User = require('../models/Users');
const AppError = require('../utils/AppError');
const config = require('../config/env');
const { hashPassword, comparePassword } = require('../utils/password');

const RESET_TOKEN_EXPIRY_MINUTES = config.passwordReset.tokenExpiryMinutes;

async function ensureEmailAvailable(email) {
  const exists = await User.exists({ email });
  if (exists) {
    throw new AppError('Email already registered', 400);
  }
}

async function registerUser({ name, email, password, role }) {
  await ensureEmailAvailable(email);
  const hashedPassword = await hashPassword(password);
  const payload = { name, email, password: hashedPassword };

  if (role) {
    payload.role = role;
  }

  const user = await User.create(payload);
  return sanitizeUser(user);
}

async function authenticateUser({ email, password }) {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid credentials', 400);
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 400);
  }

  return sanitizeUser(user);
}

async function findUserById(id) {
  const user = await User.findById(id).select('-password');
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
}

async function initiatePasswordReset(email) {
  const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpires');
  if (!user) {
    return { token: null, user: null };
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);
  await user.save();

  return { token: rawToken, user: sanitizeUser(user) };
}

async function resetPassword({ token, password }) {
  if (!token) {
    throw new AppError('Reset token is required', 400);
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  }).select('+password +resetPasswordToken +resetPasswordExpires');

  if (!user) {
    throw new AppError('Reset link is invalid or has expired', 400);
  }

  user.password = await hashPassword(password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return sanitizeUser(user);
}

function sanitizeUser(user) {
  const { _id, name, email, role, createdAt, updatedAt } = user;
  return {
    id: _id,
    name,
    email,
    role,
    createdAt,
    updatedAt,
  };
}

module.exports = {
  registerUser,
  authenticateUser,
  findUserById,
  initiatePasswordReset,
  resetPassword,
};
