import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import logger from '../utils/logger.js';

const router = express.Router();

// Helper function to check and initialize Razorpay
const initializeRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

// Helper function to check Razorpay configuration
const checkRazorpayConfig = (res) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_SECRET;

  if (!keyId || !keySecret) {
    res.status(400).json({
      error: 'Razorpay is not configured. Please contact support to enable payments.',
    });
    return false;
  }

  return true;
};

// Create Razorpay Order
router.post('/create-order', async (req, res) => {
  if (!checkRazorpayConfig(res)) return;

  const { amount, orderId, customerEmail, customerPhone } = req.body;

  if (!amount || !orderId || !customerEmail || !customerPhone) {
    return res.status(400).json({
      error: 'Missing required fields: amount, orderId, customerEmail, customerPhone',
    });
  }

  const razorpay = initializeRazorpay();

  const options = {
    amount: Math.round(amount * 100), // Convert to paise
    currency: 'INR',
    receipt: orderId,
    customer_notify: 1,
    notes: {
      orderId,
      customerEmail,
      customerPhone,
    },
  };

  const razorpayOrder = await razorpay.orders.create(options);

  logger.info(`Razorpay order created: ${razorpayOrder.id}`);

  res.json({
    orderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
  });
});

// Create Razorpay Order (New endpoint for orders/create-razorpay-order)
router.post('/orders/create-razorpay-order', async (req, res) => {
  if (!checkRazorpayConfig(res)) return;

  const { amount, customerId, customerEmail, customerName, customerMobile, customerCompany, serviceRequirement } = req.body;

  if (!amount || !customerId || !customerEmail || !customerName || !customerMobile) {
    return res.status(400).json({
      error: 'Missing required fields: amount, customerId, customerEmail, customerName, customerMobile',
    });
  }

  const razorpay = initializeRazorpay();

  const options = {
    amount: Math.round(amount * 100), // Convert to paise
    currency: 'INR',
    receipt: 'receipt_' + Date.now(),
    customer_notify: 1,
    notes: {
      customerId,
      customerEmail,
      customerName,
      customerMobile,
      customerCompany: customerCompany || '',
      serviceRequirement: serviceRequirement || '',
    },
  };

  const order = await razorpay.orders.create(options);

  logger.info(`Razorpay order created: ${order.id}`);

  res.json({
    razorpayOrderId: order.id,
    amount: order.amount,
    currency: 'INR',
  });
});

// Verify Razorpay Payment
router.post('/verify-payment', async (req, res) => {
  if (!checkRazorpayConfig(res)) return;

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      error: 'Missing required fields: razorpay_order_id, razorpay_payment_id, razorpay_signature',
    });
  }

  const keySecret = process.env.RAZORPAY_SECRET;

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex');

  const isSignatureValid = expectedSignature === razorpay_signature;

  if (!isSignatureValid) {
    throw new Error('Payment signature verification failed');
  }

  logger.info(`Razorpay payment verified: ${razorpay_payment_id}`);

  res.json({
    success: true,
    message: 'Payment verified successfully',
    paymentId: razorpay_payment_id,
    orderId: razorpay_order_id,
  });
});

// Verify Razorpay Payment (New endpoint for orders/verify-payment)
router.post('/orders/verify-payment', async (req, res) => {
  if (!checkRazorpayConfig(res)) return;

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({
      error: 'Missing required fields: razorpayOrderId, razorpayPaymentId, razorpaySignature',
    });
  }

  const keySecret = process.env.RAZORPAY_SECRET;

  const hmac = crypto.createHmac('sha256', keySecret);
  hmac.update(razorpayOrderId + '|' + razorpayPaymentId);
  const digest = hmac.digest('hex');

  if (digest !== razorpaySignature) {
    throw new Error('Invalid signature');
  }

  logger.info(`Razorpay payment verified: ${razorpayPaymentId}`);

  res.json({
    success: true,
    message: 'Payment verified',
  });
});

export default router;