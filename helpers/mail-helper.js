// app/utils/email.js

/**
 * Send OTP email
 * @param {string} toAddress - Recipient email address
 * @param {string} subject - Email subject
 * @param {object} data - Object containing email content (data.text)
 * @param {FastifyInstance} app - Fastify instance (with app.mailer configured)
 * @returns {Promise<boolean>} - Returns true if sent successfully, false otherwise
 */
const sendEmailOtp = async (toAddress, subject, data, app) => {
  try {
    const { mailer } = app;

    if (!mailer) {
      throw new Error('Mailer service not initialized in Fastify instance.');
    }

    const info = await mailer.sendMail({
      to: toAddress || process.env.DEFAULT_OTP_EMAIL || 'souravnayak817@gmail.com',
      subject,
      text: data?.text || '',
    });

    app.log.info(`Email Message Sent: ${info.messageId}`);
    return true;
  } catch (error) {
    app.log.error(`Failed to send OTP email: ${error.message}`);
    return false;
  }
};


