import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Validate Coupon
router.post('/validate', async (req, res) => {
  const { couponCode, orderTotal } = req.body;

  if (!couponCode || orderTotal === undefined) {
    return res.status(400).json({
      error: 'Missing required fields: couponCode, orderTotal',
    });
  }

  // Query coupon from PocketBase
  const coupons = await pb.collection('coupons').getFullList({
    filter: `code = "${couponCode}"`,
  });

  if (coupons.length === 0) {
    throw new Error('Coupon code not found');
  }

  const coupon = coupons[0];

  // Validate coupon
  const today = new Date();
  const expiryDate = new Date(coupon.expiryDate);

  if (expiryDate < today) {
    throw new Error('Coupon has expired');
  }

  if (coupon.minOrderValue && coupon.minOrderValue > orderTotal) {
    throw new Error(
      `Minimum order value of ${coupon.minOrderValue} required for this coupon`
    );
  }

  if (coupon.usedCount >= coupon.usageLimit) {
    throw new Error('Coupon usage limit exceeded');
  }

  // Calculate discount amount
  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (orderTotal * coupon.discountValue) / 100;
  } else if (coupon.discountType === 'fixed') {
    discountAmount = coupon.discountValue;
  }

  logger.info(`Coupon validated: ${couponCode}`);

  res.json({
    valid: true,
    couponCode,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount,
    message: 'Coupon is valid',
  });
});

export default router;