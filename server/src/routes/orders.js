const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const orderController = require('../controllers/orderController');
const validateRequest = require('../middleware/validateRequest');
const { createOrderSchema, verifyPaymentSchema } = require('../validation/orderValidation');

const router = express.Router();

router.post('/webhook/razorpay', orderController.handleRazorpayWebhook);

router.use(authMiddleware);

router.post('/', validateRequest(createOrderSchema), orderController.createOrder);
router.post('/verify', validateRequest(verifyPaymentSchema), orderController.verifyPayment);
router.get('/mine', orderController.getMyOrders);

module.exports = router;
