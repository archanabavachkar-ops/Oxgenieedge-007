import express from 'express';
import { LeadService } from '../../services/LeadService.js';
import { RetryQueue } from '../../services/RetryQueue.js';
import pb from '../../utils/pocketbaseClient.js';
import logger from '../../utils/logger.js';

const router = express.Router();

/**
 * Verify WhatsApp webhook token
 * Middleware to validate webhook verification requests from WhatsApp
 */
const verifyToken = (req, res, next) => {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'test_token';
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (token === verifyToken) {
    logger.info('WhatsApp webhook verified successfully');
    return res.status(200).send(challenge);
  }

  logger.warn('WhatsApp webhook verification failed: Invalid token');
  return res.status(403).json({ error: 'Invalid verification token' });
};

/**
 * POST /webhook
 * Receive incoming WhatsApp messages
 */
router.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    // Validate webhook structure
    if (!body.entry || !body.entry[0] || !body.entry[0].changes || !body.entry[0].changes[0]) {
      logger.warn('Invalid WhatsApp webhook structure');
      return res.status(200).json({ success: false, message: 'Invalid webhook structure' });
    }

    const value = body.entry[0].changes[0].value;

    // Check if this is a message event
    if (!value.messages || !value.messages[0]) {
      logger.info('Webhook received but no messages to process');
      return res.status(200).json({ success: true, message: 'No messages to process' });
    }

    const message = value.messages[0];
    const senderPhone = message.from;
    const messageText = message.text?.body || `[${message.type} message]`;

    logger.info(`WhatsApp message received from ${senderPhone}: ${messageText}`);

    // Process message asynchronously
    (async () => {
      try {
        // Check if lead exists by mobile number
        let lead = null;
        try {
          const leads = await pb.collection('leads').getFullList({
            filter: `mobile = "${senderPhone}"`,
          });
          lead = leads.length > 0 ? leads[0] : null;
        } catch (error) {
          logger.warn(`Failed to fetch lead by mobile ${senderPhone}`);
        }

        // Create lead if doesn't exist
        if (!lead) {
          logger.info(`Creating new lead from WhatsApp: ${senderPhone}`);

          lead = await RetryQueue.execute(
            async () => {
              return await LeadService.createLead({
                name: `WhatsApp ${senderPhone}`,
                mobile: senderPhone,
                email: '',
                source: 'WhatsApp',
                message: messageText,
              });
            },
            3,
            1000
          );

          logger.info(`Lead created successfully: ${lead.id}`);
        } else {
          logger.info(`Lead already exists: ${lead.id}`);
        }

        // Log activity
        try {
          await pb.collection('activities').create({
            lead_id: lead.id,
            type: 'WhatsApp Message',
            description: messageText,
            content: messageText,
            related_record_type: 'whatsapp_message',
            related_record_id: message.id,
            metadata: JSON.stringify({
              senderPhone,
              messageId: message.id,
              messageType: message.type,
            }),
            created_at: new Date().toISOString(),
          });

          logger.info(`Activity logged for lead ${lead.id}`);
        } catch (activityError) {
          logger.error('Failed to log activity', activityError);
        }
      } catch (error) {
        logger.error('Error processing WhatsApp message', error);
      }
    })();

    // Return 200 immediately (async processing)
    return res.status(200).json({ success: true, message: 'Message received and queued for processing' });
  } catch (error) {
    logger.error('WhatsApp webhook error', error);
    return res.status(200).json({ success: false, error: error.message });
  }
});

/**
 * GET /webhook
 * Webhook verification endpoint
 */
router.get('/webhook', verifyToken);

export default router;
