import express from 'express';
import crypto from 'crypto';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { encryptData } from '../utils/encryption.js';

const router = express.Router();

/**
 * POST /integrations/whatsapp/connect
 * Connect WhatsApp Business Account
 */
router.post('/whatsapp/connect', async (req, res) => {
  const { phoneNumberId, businessAccountId, accessToken } = req.body;

  // Validate required fields
  if (!phoneNumberId || !businessAccountId || !accessToken) {
    return res.status(400).json({
      error: 'Missing required fields: phoneNumberId, businessAccountId, accessToken',
    });
  }

  // Validate accessToken by making request to Meta API
  const validateResponse = await fetch(
    'https://graph.instagram.com/v18.0/me/subscribed_apps',
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!validateResponse.ok) {
    throw new Error('Invalid WhatsApp credentials');
  }

  // Generate webhook verify token
  const webhookVerifyToken = crypto.randomBytes(32).toString('hex');

  // Encrypt accessToken
  const encryptionKey = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef';
  const encryptedAccessToken = encryptData(accessToken, encryptionKey).toString('hex');

  // Create whatsapp_settings record
  const whatsappSettings = await pb.collection('whatsapp_settings').create({
    whatsappPhoneNumberId: phoneNumberId,
    whatsappBusinessAccountId: businessAccountId,
    whatsappAccessToken: encryptedAccessToken,
    whatsappWebhookVerifyToken: webhookVerifyToken,
    isConnected: true,
    totalLeadsImported: 0,
    lastSyncTime: new Date().toISOString(),
  });

  logger.info('WhatsApp settings created', {
    phoneNumberId,
    businessAccountId,
    settingsId: whatsappSettings.id,
  });

  // Subscribe to webhook events
  const subscribeResponse = await fetch(
    `https://graph.instagram.com/v18.0/${phoneNumberId}/subscribed_apps`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscribed_fields: ['messages', 'message_status'],
      }),
    }
  );

  if (!subscribeResponse.ok) {
    throw new Error('Failed to subscribe to WhatsApp webhook events');
  }

  logger.info('WhatsApp webhook subscribed', { phoneNumberId });

  const webhookUrl = `${process.env.API_BASE_URL || 'https://yourdomain.com'}/hcgi/api/webhooks/whatsapp-messages`;

  res.json({
    webhookUrl,
    verifyToken: webhookVerifyToken,
  });
});

/**
 * GET /integrations/whatsapp/status
 * Get WhatsApp connection status
 */
router.get('/whatsapp/status', async (req, res) => {
  const settings = await pb.collection('whatsapp_settings').getFullList().catch(() => []);

  if (settings.length === 0) {
    return res.json({
      isConnected: false,
      lastSyncTime: null,
      totalLeadsImported: 0,
      whatsappPhoneNumberId: null,
      whatsappBusinessAccountId: null,
      whatsappWebhookVerifyToken: null,
    });
  }

  const setting = settings[0];

  logger.info('WhatsApp status retrieved', { settingsId: setting.id });

  res.json({
    isConnected: setting.isConnected || false,
    lastSyncTime: setting.lastSyncTime || null,
    totalLeadsImported: setting.totalLeadsImported || 0,
    whatsappPhoneNumberId: setting.whatsappPhoneNumberId || null,
    whatsappBusinessAccountId: setting.whatsappBusinessAccountId || null,
    whatsappWebhookVerifyToken: setting.whatsappWebhookVerifyToken || null,
  });
});

/**
 * DELETE /integrations/whatsapp/disconnect
 * Disconnect WhatsApp Business Account
 */
router.delete('/whatsapp/disconnect', async (req, res) => {
  const settings = await pb.collection('whatsapp_settings').getFullList().catch(() => []);

  if (settings.length === 0) {
    return res.status(404).json({ error: 'WhatsApp settings not found' });
  }

  const setting = settings[0];

  await pb.collection('whatsapp_settings').delete(setting.id);

  logger.info('WhatsApp settings deleted', { settingsId: setting.id });

  res.json({ success: true });
});

export default router;