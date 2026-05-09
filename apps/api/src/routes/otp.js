import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();

// In-memory storage for OTPs with expiry
const otpStore = new Map();

// Helper function to generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to send OTP via Twilio WhatsApp
const sendWhatsAppOTP = async (mobile, otp) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !whatsappNumber) {
    return { success: false, message: 'WhatsApp OTP service not configured' };
  }

  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: `whatsapp:${whatsappNumber}`,
        To: `whatsapp:${mobile}`,
        Body: `Your OTP is: ${otp}. Valid for 5 minutes.`,
      }).toString(),
    });

    if (!response.ok) {
      throw new Error(`Twilio API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    logger.info(`WhatsApp OTP sent to ${mobile}`);
    return { success: true, message: 'OTP sent to WhatsApp', sid: data.sid };
  } catch (error) {
    logger.error(`Failed to send WhatsApp OTP: ${error.message}`);
    throw error;
  }
};

// POST /otp/send-whatsapp
router.post('/send-whatsapp', async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({
      error: 'Missing required field: mobile',
    });
  }

  // Check if Twilio is configured
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !whatsappNumber) {
    return res.json({
      success: false,
      message: 'WhatsApp OTP service not configured',
    });
  }

  // Generate OTP
  const otp = generateOTP();

  // Send OTP via Twilio
  const result = await sendWhatsAppOTP(mobile, otp);

  if (!result.success) {
    return res.json(result);
  }

  // Store OTP with 5-minute expiry
  const expiryTime = Date.now() + 5 * 60 * 1000;
  otpStore.set(mobile, { otp, expiryTime });

  logger.info(`OTP generated and stored for ${mobile}`);

  res.json({
    success: true,
    message: 'OTP sent to WhatsApp',
  });
});

// POST /otp/verify
router.post('/verify', async (req, res) => {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    return res.status(400).json({
      error: 'Missing required fields: mobile, otp',
    });
  }

  // Check if OTP exists
  const storedData = otpStore.get(mobile);

  if (!storedData) {
    return res.json({
      success: false,
      verified: false,
      message: 'Invalid OTP',
    });
  }

  // Check if OTP has expired
  if (Date.now() > storedData.expiryTime) {
    otpStore.delete(mobile);
    return res.json({
      success: false,
      verified: false,
      message: 'Invalid OTP',
    });
  }

  // Verify OTP
  if (storedData.otp !== otp) {
    return res.json({
      success: false,
      verified: false,
      message: 'Invalid OTP',
    });
  }

  // OTP is valid, clear it
  otpStore.delete(mobile);

  logger.info(`OTP verified for ${mobile}`);

  res.json({
    success: true,
    verified: true,
  });
});

export default router;