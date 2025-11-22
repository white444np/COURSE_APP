const sgMail = require('@sendgrid/mail');
const config = require('../config/env');

let isConfigured = false;

function configureSendGrid() {
  if (isConfigured) {
    return;
  }

  const { email } = config;
  if (!email?.enabled || email.provider !== 'sendgrid') {
    throw new Error('Email transport is not configured. Set SendGrid environment variables to enable email sending.');
  }

  if (!email.sendgrid?.apiKey) {
    throw new Error('SendGrid API key is missing. Set SENDGRID_API_KEY to enable email sending.');
  }

  sgMail.setApiKey(email.sendgrid.apiKey);
  isConfigured = true;
}

async function sendEmail({ to, subject, html, text }) {
  if (!to) {
    throw new Error('Email recipient is required');
  }

  configureSendGrid();

  const message = {
    to,
    from: config.email.from,
    subject,
    text,
    html,
  };

  try {
    const response = await sgMail.send(message);
    return response;
  } catch (error) {
    const statusCode = error?.code || error?.response?.statusCode;
    const details = Array.isArray(error?.response?.body?.errors)
      ? error.response.body.errors.map((entry) => entry.message).join('; ')
      : undefined;

    if (statusCode === 403) {
      throw new Error(
        `SendGrid rejected the request (403 Forbidden). Ensure the API key has "Mail Send" permission and the sender ${config.email.from} is a verified sender. ${details ? `Details: ${details}` : ''}`.trim(),
      );
    }

    throw new Error(details || error.message || 'Failed to send email via SendGrid');
  }
}

module.exports = {
  sendEmail,
};
