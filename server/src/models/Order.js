const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true,
  },
  provider: {
    type: String,
    enum: ['razorpay'],
    default: 'razorpay',
    index: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Order amount cannot be negative'],
  },
  currency: {
    type: String,
    default: 'INR',
    uppercase: true,
    trim: true,
  },
  receipt: {
    type: String,
    trim: true,
  },
  razorpayOrderId: {
    type: String,
    index: true,
  },
  razorpayPaymentId: {
    type: String,
    index: true,
  },
  razorpaySignature: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
    index: true,
  },
  paymentVerifiedAt: {
    type: Date,
  },
}, {
  timestamps: { createdAt: true, updatedAt: true },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

module.exports = mongoose.model('Order', orderSchema);
