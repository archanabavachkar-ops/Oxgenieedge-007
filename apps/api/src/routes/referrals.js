import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Track Referral
router.post('/track', async (req, res) => {
  const { partnerId, customerId, orderId, commissionAmount } = req.body;

  if (!partnerId || !customerId || !orderId || commissionAmount === undefined) {
    return res.status(400).json({
      error: 'Missing required fields: partnerId, customerId, orderId, commissionAmount',
    });
  }

  // Create referral record in PocketBase
  const referralRecord = await pb.collection('referrals').create({
    partnerId,
    customerId,
    orderId,
    commissionAmount,
    status: 'pending',
  });

  logger.info(`Referral tracked: ${referralRecord.id}`);

  res.json({
    success: true,
    referralId: referralRecord.id,
  });
});

// Complete Referral
router.post('/complete', async (req, res) => {
  const { referralId } = req.body;

  if (!referralId) {
    return res.status(400).json({
      error: 'Missing required field: referralId',
    });
  }

  // Get referral record
  const referral = await pb.collection('referrals').getOne(referralId);

  // Update referral status to 'completed'
  await pb.collection('referrals').update(referralId, {
    status: 'completed',
  });

  // Get partner record
  const partner = await pb.collection('partners').getOne(referral.partnerId);

  // Update partner's totalCommission and totalReferrals
  await pb.collection('partners').update(referral.partnerId, {
    totalCommission: (partner.totalCommission || 0) + referral.commissionAmount,
    totalReferrals: (partner.totalReferrals || 0) + 1,
  });

  logger.info(`Referral completed: ${referralId}`);

  res.json({
    success: true,
  });
});

export default router;