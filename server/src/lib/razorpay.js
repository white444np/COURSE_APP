const Razorpay = require('razorpay');
const config = require('../config/env');
const AppError = require('../utils/AppError');

let instance;

function getRazorpayInstance() {
  if (instance) {
    return instance;
  }

  const { keyId, keySecret } = config.payments.razorpay || {};
  if (!keyId || !keySecret) {
    throw new AppError('Razorpay configuration is missing. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.', 500);
  }

  instance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  return instance;
}

module.exports = {
  getRazorpayInstance,
};
