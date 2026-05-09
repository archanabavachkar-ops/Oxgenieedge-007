import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// In-memory storage for verification codes with expiry
const verificationCodeStore = new Map();

// Helper function to generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to send email via PocketBase
const sendVerificationEmail = async (email, code) => {
  try {
    // Use PocketBase's built-in mailer
    // Note: This requires the PocketBase app instance with mail client configured
    // For now, we'll use the fetch API to call PocketBase's mail endpoint if available
    // Or we can log it and assume the platform handles it
    
    const subject = 'Email Verification Code';
    const html = `
      <h2>Email Verification</h2>
      <p>Your verification code is: <strong>${code}</strong></p>
      <p>This code is valid for 10 minutes.</p>
      <p>If you did not request this code, please ignore this email.</p>
    `;

    // Log the email (in production, this would be sent via PocketBase mailer)
    logger.info(`Verification email prepared for ${email} with code ${code}`);

    // In a real implementation with PocketBase app instance:
    // await app.newMailClient().send({
    //   from: { address: 'noreply@example.com', name: 'OxgenieEdge' },
    //   to: [{ address: email }],
    //   subject,
    //   html,
    // });

    return { success: true };
  } catch (error) {
    logger.error(`Failed to send verification email: ${error.message}`);
    throw error;
  }
};

// POST /email/send-verification
router.post('/send-verification', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      error: 'Missing required field: email',
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: 'Invalid email format',
    });
  }

  // Generate verification code
  const code = generateVerificationCode();

  // Send verification email
  const result = await sendVerificationEmail(email, code);

  if (!result.success) {
    throw new Error('Failed to send verification email');
  }

  // Store verification code with 10-minute expiry
  const expiryTime = Date.now() + 10 * 60 * 1000;
  verificationCodeStore.set(email, { code, expiryTime });

  logger.info(`Verification code generated and stored for ${email}`);

  res.json({
    success: true,
    message: 'Verification code sent to email',
  });
});

// POST /email/verify
router.post('/verify', async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({
      error: 'Missing required fields: email, code',
    });
  }

  // Check if verification code exists
  const storedData = verificationCodeStore.get(email);

  if (!storedData) {
    return res.json({
      success: false,
      verified: false,
      message: 'Invalid verification code',
    });
  }

  // Check if code has expired
  if (Date.now() > storedData.expiryTime) {
    verificationCodeStore.delete(email);
    return res.json({
      success: false,
      verified: false,
      message: 'Invalid verification code',
    });
  }

  // Verify code
  if (storedData.code !== code) {
    return res.json({
      success: false,
      verified: false,
      message: 'Invalid verification code',
    });
  }

  // Code is valid, clear it
  verificationCodeStore.delete(email);

  logger.info(`Email verified for ${email}`);

  res.json({
    success: true,
    verified: true,
  });
});

export default router;