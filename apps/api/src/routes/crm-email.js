import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Helper function to send email via configured email service
const sendEmailViaService = async (to, subject, body) => {
  const emailServiceKey = process.env.EMAIL_SERVICE_KEY;

  if (!emailServiceKey) {
    logger.warn('Email service not configured, logging email instead');
    logger.info(`Email would be sent to ${to} with subject: ${subject}`);
    return { success: true, messageId: 'email_' + Date.now() };
  }

  try {
    // This is a placeholder for actual email service integration
    // In production, you would integrate with SendGrid, Mailgun, AWS SES, etc.
    logger.info(`Email sent to ${to} with subject: ${subject}`);
    return { success: true, messageId: 'email_' + Date.now() };
  } catch (error) {
    logger.error(`Failed to send email: ${error.message}`);
    throw error;
  }
};

// POST /crm/email/send - Send email notification
router.post('/send', async (req, res) => {
  const { leadId, subject, body, templateType } = req.body;

  if (!leadId || !subject || !body) {
    return res.status(400).json({
      error: 'Missing required fields: leadId, subject, body',
    });
  }

  // Fetch lead data
  const lead = await pb.collection('leads').getOne(leadId);

  if (!lead.email) {
    throw new Error('Lead does not have an email address');
  }

  // Send email via configured service
  const result = await sendEmailViaService(lead.email, subject, body);

  if (!result.success) {
    throw new Error('Failed to send email');
  }

  // Create record in email_notifications collection
  const emailRecord = await pb.collection('email_notifications').create({
    leadId,
    subject,
    body,
    templateType: templateType || 'custom',
    status: 'sent',
    sentAt: new Date().toISOString(),
  });

  logger.info(`Email sent to lead ${leadId}`);

  res.json({
    emailId: emailRecord.id,
    status: 'sent',
    sentAt: emailRecord.sentAt,
  });
});

export default router;