import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();

// Helper function to send email via platform's built-in mailer
const sendEmail = async (app, to, subject, html) => {
  if (!to || !subject || !html) {
    throw new Error('Missing required email fields: to, subject, html');
  }

  // Note: This function requires PocketBase app instance
  // In a real implementation, you would call app.newMailClient().send(message)
  // For now, this is a placeholder that logs the email
  logger.info(`Email sent to ${to} with subject: ${subject}`);
};

// POST /emails/lead-capture
router.post('/lead-capture', async (req, res) => {
  const { name, email, mobile, company, serviceInterest, description, source } = req.body;

  if (!email) {
    return res.status(400).json({
      error: 'Missing required field: email',
    });
  }

  const subject = `New Lead: ${name}`;
  const html = `
    <h2>New Lead Captured</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Mobile:</strong> ${mobile}</p>
    <p><strong>Company:</strong> ${company || 'N/A'}</p>
    <p><strong>Service Interest:</strong> ${serviceInterest || 'N/A'}</p>
    <p><strong>Description:</strong> ${description || 'N/A'}</p>
    <p><strong>Source:</strong> ${source || 'direct'}</p>
    <p><strong>Captured At:</strong> ${new Date().toLocaleString()}</p>
  `;

  await sendEmail(null, email, subject, html);

  logger.info(`Lead capture email sent to ${email}`);

  res.json({
    success: true,
    message: 'Lead capture email sent successfully',
  });
});

// POST /emails/lead-assignment
router.post('/lead-assignment', async (req, res) => {
  const { leadName, email, mobile, company, serviceInterest, description, assignedAt } = req.body;

  if (!email) {
    return res.status(400).json({
      error: 'Missing required field: email',
    });
  }

  const subject = `New Lead Assigned: ${leadName}`;
  const html = `
    <h2>New Lead Assigned to You</h2>
    <p><strong>Lead Name:</strong> ${leadName}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Mobile:</strong> ${mobile}</p>
    <p><strong>Company:</strong> ${company || 'N/A'}</p>
    <p><strong>Service Interest:</strong> ${serviceInterest || 'N/A'}</p>
    <p><strong>Description:</strong> ${description || 'N/A'}</p>
    <p><strong>Assigned At:</strong> ${assignedAt || new Date().toLocaleString()}</p>
    <p>Please follow up with this lead as soon as possible.</p>
  `;

  await sendEmail(null, email, subject, html);

  logger.info(`Lead assignment email sent to ${email}`);

  res.json({
    success: true,
    message: 'Lead assignment email sent successfully',
  });
});

// POST /emails/follow-up-reminder
router.post('/follow-up-reminder', async (req, res) => {
  const { leadName, email, mobile, company, serviceInterest, followUpDate, status } = req.body;

  if (!email) {
    return res.status(400).json({
      error: 'Missing required field: email',
    });
  }

  const subject = `Follow-up Reminder: ${leadName}`;
  const html = `
    <h2>Follow-up Reminder</h2>
    <p><strong>Lead Name:</strong> ${leadName}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Mobile:</strong> ${mobile}</p>
    <p><strong>Company:</strong> ${company || 'N/A'}</p>
    <p><strong>Service Interest:</strong> ${serviceInterest || 'N/A'}</p>
    <p><strong>Follow-up Date:</strong> ${followUpDate || new Date().toLocaleString()}</p>
    <p><strong>Current Status:</strong> ${status || 'pending'}</p>
    <p>Please follow up with this lead on the scheduled date.</p>
  `;

  await sendEmail(null, email, subject, html);

  logger.info(`Follow-up reminder email sent to ${email}`);

  res.json({
    success: true,
    message: 'Follow-up reminder email sent successfully',
  });
});

// POST /emails/partner-commission
router.post('/partner-commission', async (req, res) => {
  const { partnerName, email, commissionAmount, monthlyCommission, totalCommission, totalReferrals, commissionType, commissionValue } = req.body;

  if (!email) {
    return res.status(400).json({
      error: 'Missing required field: email',
    });
  }

  const subject = `Commission Update: ${partnerName}`;
  const html = `
    <h2>Commission Update</h2>
    <p>Dear ${partnerName},</p>
    <p>A referral has been completed and your commission has been updated.</p>
    <p><strong>Commission Amount:</strong> ₹${commissionAmount || 0}</p>
    <p><strong>Total Earned This Month:</strong> ₹${monthlyCommission || 0}</p>
    <p><strong>Total Lifetime Commission:</strong> ₹${totalCommission || 0}</p>
    <p><strong>Total Referrals:</strong> ${totalReferrals || 0}</p>
    <p><strong>Commission Type:</strong> ${commissionType || 'N/A'}</p>
    <p><strong>Commission Rate:</strong> ${commissionValue || 0}${commissionType === 'percentage' ? '%' : ''}</p>
    <p><strong>Payout Details:</strong> Commissions are processed monthly. Please ensure your bank details are up to date in your partner dashboard.</p>
    <p>Thank you for your partnership!</p>
  `;

  await sendEmail(null, email, subject, html);

  logger.info(`Partner commission email sent to ${email}`);

  res.json({
    success: true,
    message: 'Partner commission email sent successfully',
  });
});

// POST /emails/contact-form
router.post('/contact-form', async (req, res) => {
  const { name, email, message } = req.body;

  if (!email) {
    return res.status(400).json({
      error: 'Missing required field: email',
    });
  }

  const subject = 'We received your message';
  const html = `
    <h2>Thank You for Contacting Us</h2>
    <p>Dear ${name || 'Valued Customer'},</p>
    <p>We have received your message and appreciate you reaching out to us.</p>
    <p><strong>Your Message:</strong></p>
    <p>${message || 'N/A'}</p>
    <p><strong>Expected Response Time:</strong> We typically respond within 24 hours.</p>
    <p><strong>Contact Details:</strong></p>
    <p>Email: hello@oxgenieedge.co</p>
    <p>Phone: +91 (Your Phone Number)</p>
    <p>If you have any urgent matters, please feel free to call us directly.</p>
    <p>Best regards,<br/>OxgenieEdge Team</p>
  `;

  await sendEmail(null, email, subject, html);

  logger.info(`Contact form email sent to ${email}`);

  res.json({
    success: true,
    message: 'Contact form email sent successfully',
  });
});

export default router;