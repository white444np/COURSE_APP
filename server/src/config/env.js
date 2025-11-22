const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const envLocations = [
  path.resolve(__dirname, '../../.env'), // server/.env
  path.resolve(__dirname, '../../../.env'), // project root .env
];

envLocations.forEach((location) => {
  if (fs.existsSync(location)) {
    dotenv.config({ path: location, override: false });
  }
});

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null) {
    return fallback;
  }

  const normalized = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) {
    return true;
  }
  if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) {
    return false;
  }

  return fallback;
}

const requiredVars = ['JWT_SECRET'];
const missing = requiredVars.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/minicourse',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  passwordReset: {
    tokenExpiryMinutes: Number(process.env.RESET_TOKEN_EXPIRY_MINUTES) || 30,
  },
  admin: {
    name: process.env.ADMIN_NAME || 'MiniCourse Admin',
    email: process.env.ADMIN_EMAIL || 'admin@minicourse.dev',
    password: process.env.ADMIN_PASSWORD || 'Admin@1234',
    forceReset: parseBoolean(process.env.ADMIN_FORCE_RESET, false),
  },
  payments: {
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID || '',
      keySecret: process.env.RAZORPAY_KEY_SECRET || '',
      webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
      currency: process.env.RAZORPAY_CURRENCY || 'INR',
    },
  },
  email: {
    from: process.env.SENDGRID_FROM || process.env.ADMIN_EMAIL || 'MiniCourse <no-reply@minicourse.dev>',
    provider: 'sendgrid',
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY || '',
    },
    enabled: Boolean(process.env.SENDGRID_API_KEY) && Boolean(process.env.SENDGRID_FROM || process.env.ADMIN_EMAIL),
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
};
