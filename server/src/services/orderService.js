const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Course = require('../models/Course');
const User = require('../models/Users');
const AppError = require('../utils/AppError');
const config = require('../config/env');
const { getRazorpayInstance } = require('../lib/razorpay');
const { sendPaymentConfirmationEmail } = require('./emailService');

function toObjectId(value, label = 'identifier') {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new AppError(`Invalid ${label}`, 400);
  }

  return new mongoose.Types.ObjectId(value);
}

function ensureValidId(id, label) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${label || 'identifier'}`, 400);
  }
}

async function createOrder({ userId, courseId }) {
  if (!courseId) {
    throw new AppError('Course is required', 400);
  }

  ensureValidId(courseId, 'course identifier');
  ensureValidId(userId, 'user identifier');

  const course = await Course.findById(courseId).lean();
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  const amount = Number(course.price);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new AppError('Course price must be greater than zero to initiate payment', 400);
  }

  const existingPaidOrder = await Order.findOne({
    userId,
    courseId,
    status: 'paid',
  }).lean();

  if (existingPaidOrder) {
    throw new AppError('You have already purchased this course', 400);
  }

  const razorpay = getRazorpayInstance();
  const currency = (config.payments?.razorpay?.currency || 'INR').toUpperCase();
  const amountInSubUnits = Math.round(amount * 100);

  const receipt = `order_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;

  let razorpayOrder;
  try {
    razorpayOrder = await razorpay.orders.create({
      amount: amountInSubUnits,
      currency,
      receipt,
      notes: {
        courseId: String(courseId),
        userId: String(userId),
      },
    });
  } catch (error) {
    const providerError = error?.error || {};
    const message = providerError.description || providerError.error?.description || error.message || 'Unable to initiate payment';
    throw new AppError(message, 400, {
      provider: 'razorpay',
      reason: providerError.reason || providerError.code || 'order_creation_failed',
    });
  }

  const order = await Order.create({
    userId,
    courseId,
    amount,
    currency,
    receipt: razorpayOrder.receipt,
    razorpayOrderId: razorpayOrder.id,
    status: 'pending',
  });

  return {
    order: order.toObject({ virtuals: true }),
    course,
    razorpayOrder,
    keyId: config.payments.razorpay.keyId,
  };
}

async function verifyPayment({
  userId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) {
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new AppError('Invalid payment verification payload', 400);
  }

  const order = await Order.findOne({ razorpayOrderId });
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (String(order.userId) !== String(userId)) {
    throw new AppError('You are not authorized to verify this payment', 403);
  }

  if (order.status === 'paid') {
    const course = await Course.findById(order.courseId).lean();
    return {
      order: order.toObject({ virtuals: true }),
      course,
      alreadyVerified: true,
      emailDispatched: false,
    };
  }

  const keySecret = config.payments.razorpay.keySecret;
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex');

  const isValid = expectedSignature === razorpaySignature;

  const updatePayload = {
    razorpayPaymentId,
    razorpaySignature,
  };

  let status = 'failed';
  if (isValid) {
    status = 'paid';
    updatePayload.paymentVerifiedAt = new Date();
  }

  updatePayload.status = status;

  const updatedOrder = await Order.findByIdAndUpdate(order._id, updatePayload, {
    new: true,
  });

  if (!isValid) {
    throw new AppError('Payment verification failed', 400);
  }

  const [course, user] = await Promise.all([
    Course.findById(order.courseId).lean(),
    User.findById(order.userId).lean(),
  ]);

  let emailDispatched = false;
  let emailError;
  if (config.email?.enabled && course && user) {
    try {
      const emailResult = await sendPaymentConfirmationEmail({
        user,
        course,
        order: updatedOrder,
      });

      if (Array.isArray(emailResult)) {
        emailDispatched = emailResult.some((entry) => entry?.statusCode === 202);
      } else if (emailResult?.accepted) {
        emailDispatched = Array.isArray(emailResult.accepted) && emailResult.accepted.length > 0;
      }
    } catch (err) {
      console.error('Failed to send payment confirmation email', err);
      emailError = err?.message || 'Email dispatch failed';
    }
  }

  return {
    order: updatedOrder.toObject({ virtuals: true }),
    course,
    emailDispatched,
    emailError,
  };
}

async function handleRazorpayWebhook({ signature, rawBody }) {
  const webhookSecret = config.payments.razorpay.webhookSecret;
  if (!webhookSecret) {
    throw new AppError('Razorpay webhook secret is not configured', 500);
  }

  const payload = rawBody.toString('utf8');
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');

  if (signature !== expectedSignature) {
    throw new AppError('Invalid Razorpay webhook signature', 400);
  }

  const data = JSON.parse(payload);
  const event = data.event;
  const paymentEntity = data?.payload?.payment?.entity;

  if (!paymentEntity || !paymentEntity.order_id) {
    return {
      processed: false,
      reason: 'No payment entity in webhook payload',
    };
  }

  const order = await Order.findOne({ razorpayOrderId: paymentEntity.order_id });
  if (!order) {
    return {
      processed: false,
      reason: 'Order not found for webhook',
    };
  }

  const status = ['captured', 'authorized'].includes(paymentEntity.status)
    ? 'paid'
    : ['failed', 'refunded', 'cancelled'].includes(paymentEntity.status)
      ? 'failed'
      : order.status;

  const updatePayload = {
    razorpayPaymentId: paymentEntity.id,
    status,
  };

  if (status === 'paid') {
    updatePayload.paymentVerifiedAt = new Date();
    updatePayload.razorpaySignature = signature;
  }

  const updatedOrder = await Order.findByIdAndUpdate(order._id, updatePayload, {
    new: true,
  });

  return {
    processed: status !== order.status,
    event,
    order: updatedOrder.toObject({ virtuals: true }),
  };
}

async function getUserOrders(userId) {
  const objectId = toObjectId(userId, 'user identifier');

  const results = await Order.aggregate([
    {
      $match: {
        userId: objectId,
        status: 'paid',
      },
    },
    {
      $lookup: {
        from: 'courses',
        localField: 'courseId',
        foreignField: '_id',
        as: 'course',
      },
    },
    {
      $unwind: {
        path: '$course',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        provider: 1,
        amount: 1,
        currency: 1,
        courseId: 1,
        paymentVerifiedAt: 1,
        createdAt: 1,
        updatedAt: 1,
        course: {
          _id: '$course._id',
          title: '$course.title',
          description: '$course.description',
          category: '$course.category',
          price: '$course.price',
          thumbnail: '$course.thumbnail',
        },
      },
    },
    {
      $sort: {
        paymentVerifiedAt: -1,
        createdAt: -1,
      },
    },
  ]);

  return results.map((entry) => ({
    id: entry._id,
    provider: entry.provider,
    amount: entry.amount,
    currency: entry.currency,
    courseId: entry.courseId,
    paymentVerifiedAt: entry.paymentVerifiedAt,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    course: entry.course || null,
  }));
}

module.exports = {
  createOrder,
  verifyPayment,
  handleRazorpayWebhook,
  getUserOrders,
};
