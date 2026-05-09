import express from 'express';
import Stripe from 'stripe';
import logger from '../utils/logger.js';

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Payment Intent
router.post('/create-payment-intent', async (req, res) => {
  const { amount, orderId, customerEmail } = req.body;

  if (!amount || !orderId || !customerEmail) {
    return res.status(400).json({
      error: 'Missing required fields: amount, orderId, customerEmail',
    });
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: 'inr',
    metadata: {
      orderId,
      customerEmail,
    },
  });

  logger.info(`Stripe payment intent created: ${paymentIntent.id}`);

  res.json({
    clientSecret: paymentIntent.client_secret,
    amount: paymentIntent.amount,
    intentId: paymentIntent.id,
  });
});

// Retrieve Payment Intent
router.get('/payment-intent/:intentId', async (req, res) => {
  const { intentId } = req.params;

  if (!intentId) {
    return res.status(400).json({
      error: 'Missing required field: intentId',
    });
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(intentId);

  res.json({
    id: paymentIntent.id,
    status: paymentIntent.status,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    metadata: paymentIntent.metadata,
  });
});

export default router;