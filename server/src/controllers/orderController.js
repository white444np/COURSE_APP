const orderService = require('../services/orderService');

async function createOrder(req, res, next) {
  try {
    const { order, course, razorpayOrder, keyId } = await orderService.createOrder({
      userId: req.user.id,
      courseId: req.body.courseId,
    });

    return res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order._id,
        provider: order.provider,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
        createdAt: order.createdAt,
        razorpayOrderId: order.razorpayOrderId,
      },
      course: {
        id: course._id,
        title: course.title,
        price: course.price,
        category: course.category,
        description: course.description,
      },
      payment: {
        provider: 'razorpay',
        credentials: {
          keyId,
        },
        order: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          receipt: razorpayOrder.receipt,
          status: razorpayOrder.status,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function verifyPayment(req, res, next) {
  try {
    const { order, course, alreadyVerified, emailDispatched, emailError } = await orderService.verifyPayment({
      userId: req.user.id,
      razorpayOrderId: req.body.razorpayOrderId,
      razorpayPaymentId: req.body.razorpayPaymentId,
      razorpaySignature: req.body.razorpaySignature,
    });

    return res.json({
      message: alreadyVerified ? 'Payment already verified' : 'Payment verified successfully',
      order: {
        id: order._id,
        provider: order.provider,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
        paymentVerifiedAt: order.paymentVerifiedAt,
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentId: order.razorpayPaymentId,
      },
      course: {
        id: course?._id || order.courseId,
        title: course?.title,
        price: course?.price,
        category: course?.category,
        description: course?.description,
      },
      email: {
        dispatched: emailDispatched,
        error: emailError,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function handleRazorpayWebhook(req, res, next) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      return res.status(400).json({ success: false, message: 'Missing Razorpay signature header' });
    }

    const rawBody = req.rawBody && Buffer.isBuffer(req.rawBody)
      ? req.rawBody
      : Buffer.from(JSON.stringify(req.body || {}));

    const result = await orderService.handleRazorpayWebhook({
      signature,
      rawBody,
    });

    return res.status(200).json({
      success: true,
      processed: result.processed,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }

    return next(error);
  }
}

async function getMyOrders(req, res, next) {
  try {
    const orders = await orderService.getUserOrders(req.user.id);

    return res.json({
      message: 'Orders fetched successfully',
      orders,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createOrder,
  verifyPayment,
  handleRazorpayWebhook,
  getMyOrders,
};
