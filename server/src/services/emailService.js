const config = require('../config/env');
const { sendEmail } = require('../utils/sendEmail');

function buildPaymentConfirmationHtml({ userName, courseTitle, amount, currency, orderId, paymentId }) {
	const formattedAmount = typeof amount === 'number' ? amount.toFixed(2) : amount;

	return `
		<div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #1f2933;">
			<h2 style="color: #0b7285;">Payment Confirmed</h2>
			<p>Hi ${userName || 'there'},</p>
			<p>Thank you for your purchase. We have successfully received your payment for <strong>${courseTitle}</strong>.</p>
			<table style="border-collapse: collapse; margin: 16px 0; width: 100%; max-width: 420px;">
				<tbody>
					<tr>
						<td style="padding: 8px; border: 1px solid #cbd5e1;">Amount</td>
						<td style="padding: 8px; border: 1px solid #cbd5e1;">${currency} ${formattedAmount}</td>
					</tr>
					<tr>
						<td style="padding: 8px; border: 1px solid #cbd5e1;">Order ID</td>
						<td style="padding: 8px; border: 1px solid #cbd5e1;">${orderId}</td>
					</tr>
					<tr>
						<td style="padding: 8px; border: 1px solid #cbd5e1;">Payment ID</td>
						<td style="padding: 8px; border: 1px solid #cbd5e1;">${paymentId}</td>
					</tr>
				</tbody>
			</table>
			<p>You can now access the course from your dashboard.</p>
			<p style="margin-top: 24px;">Regards,<br/>${config.admin.name}</p>
		</div>
	`;
}

function buildPaymentConfirmationText({ userName, courseTitle, amount, currency, orderId, paymentId }) {
	const formattedAmount = typeof amount === 'number' ? amount.toFixed(2) : amount;

	return [
		`Hi ${userName || 'there'},`,
		'',
		`Thank you for your purchase. We have successfully received your payment for ${courseTitle}.`,
		'',
		`Amount: ${currency} ${formattedAmount}`,
		`Order ID: ${orderId}`,
		`Payment ID: ${paymentId}`,
		'',
		'You can now access the course from your dashboard.',
		'',
		`Regards,`,
		config.admin.name,
	].join('\n');
}

async function sendPaymentConfirmationEmail({ user, course, order }) {
	if (!config.email?.enabled) {
		throw new Error('Email transport is not configured');
	}

	if (!user?.email) {
		throw new Error('User email address is required to send payment confirmation');
	}

	if (!course?.title) {
		throw new Error('Course title is required to send payment confirmation');
	}

	if (!order?.razorpayOrderId || !order?.razorpayPaymentId) {
		throw new Error('Order identifiers are required to send payment confirmation');
	}

	const amount = order.amount;
	const currency = (order.currency || 'INR').toUpperCase();

	const payload = {
		to: user.email,
		subject: `Payment confirmed for ${course.title}`,
		html: buildPaymentConfirmationHtml({
			userName: user.name,
			courseTitle: course.title,
			amount,
			currency,
			orderId: order.razorpayOrderId,
			paymentId: order.razorpayPaymentId,
		}),
		text: buildPaymentConfirmationText({
			userName: user.name,
			courseTitle: course.title,
			amount,
			currency,
			orderId: order.razorpayOrderId,
			paymentId: order.razorpayPaymentId,
		}),
	};

	return sendEmail(payload);
}

module.exports = {
	sendPaymentConfirmationEmail,
};
