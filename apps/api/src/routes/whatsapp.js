import express from 'express';
import crypto from 'crypto';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * Verify webhook signature using HMAC-SHA256
 * @param {string} body - Raw request body as string
 * @param {string} signature - X-Hub-Signature-256 header value
 * @param {string} secret - Webhook secret from environment
 * @returns {boolean} True if signature is valid
 */
function verifyWebhookSignature(body, signature, secret) {
  if (!signature || !secret) {
    return false;
  }

  // Signature format: sha256=<hash>
  const expectedSignature = `sha256=${crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')}`;

  return signature === expectedSignature;
}

/**
 * GET /webhook
 * Meta webhook verification endpoint
 * Validates verify_token and responds with challenge
 */
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (!mode || !token || !challenge) {
    logger.warn('WhatsApp webhook verification: missing parameters', {
      mode,
      token: token ? 'present' : 'missing',
      challenge: challenge ? 'present' : 'missing',
    });
    throw new Error('Missing webhook verification parameters');
  }

  // Get verify token from environment or use fallback
  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'whatsapp_verify_token_secure_2024';

  if (mode !== 'subscribe' || token !== expectedToken) {
    logger.warn('WhatsApp webhook verification failed', {
      mode,
      tokenMatch: token === expectedToken,
    });
    throw new Error('Invalid webhook verification token');
  }

  logger.info('WhatsApp webhook verified successfully');
  res.status(200).send(challenge);
});

/**
 * POST /webhook
 * Receive incoming WhatsApp messages and events
 * Validates signature and logs webhook data
 */
router.post('/webhook', async (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const webhookSecret = process.env.WEBHOOK_SECRET || process.env.WHATSAPP_WEBHOOK_SECRET;

  // Get raw body for signature verification
  const rawBody = req.rawBody || JSON.stringify(req.body);

  // Verify webhook signature
  if (webhookSecret && !verifyWebhookSignature(rawBody, signature, webhookSecret)) {
    logger.warn('WhatsApp webhook signature validation failed', {
      signaturePresent: !!signature,
      secretConfigured: !!webhookSecret,
    });
    throw new Error('Invalid webhook signature');
  }

  const body = req.body;

  // Validate webhook structure
  if (!body.entry || !Array.isArray(body.entry) || body.entry.length === 0) {
    logger.warn('WhatsApp webhook: invalid structure', { body });
    throw new Error('Invalid webhook payload structure');
  }

  // Process each entry
  for (const entry of body.entry) {
    if (!entry.changes || !Array.isArray(entry.changes)) {
      continue;
    }

    for (const change of entry.changes) {
      const value = change.value;

      if (!value) {
        continue;
      }

      // Log webhook data to PocketBase
      await logWebhookData(value);

      // Process messages
      if (value.messages && Array.isArray(value.messages)) {
        for (const message of value.messages) {
          await processIncomingMessage(message, value);
        }
      }

      // Process status updates
      if (value.statuses && Array.isArray(value.statuses)) {
        for (const status of value.statuses) {
          await processStatusUpdate(status, value);
        }
      }
    }
  }

  // Acknowledge receipt immediately
  res.status(200).json({ success: true });
});

/**
 * Log webhook data to PocketBase for audit trail
 * @param {Object} value - Webhook value object
 */
async function logWebhookData(value) {
  try {
    await pb.collection('whatsapp_webhook_logs').create({
      phone_number_id: value.metadata?.phone_number_id || '',
      business_account_id: value.metadata?.business_account_id || '',
      message_count: value.messages?.length || 0,
      status_count: value.statuses?.length || 0,
      payload: JSON.stringify(value),
      received_at: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to log webhook data to PocketBase', error);
    // Don't throw - logging failure shouldn't break message processing
  }
}

/**
 * Process incoming WhatsApp message
 * @param {Object} message - Message object from webhook
 * @param {Object} value - Webhook value object containing metadata
 */
async function processIncomingMessage(message, value) {
  try {
    const { id: messageId, from, timestamp, type, text, image, document, audio, video, button, interactive } = message;

    if (!from || !messageId) {
      logger.warn('WhatsApp message: missing required fields', { from, messageId });
      return;
    }

    logger.info('WhatsApp message received', {
      messageId,
      from,
      type,
      timestamp,
    });

    // Extract message content based on type
    let messageContent = '';
    let mediaUrl = null;
    let mediaType = null;

    switch (type) {
      case 'text':
        messageContent = text?.body || '';
        break;

      case 'image':
        mediaUrl = image?.link || '';
        mediaType = 'image';
        messageContent = image?.caption || '[Image]';
        break;

      case 'document':
        mediaUrl = document?.link || '';
        mediaType = 'document';
        messageContent = document?.caption || `[Document: ${document?.filename}]`;
        break;

      case 'audio':
        mediaUrl = audio?.link || '';
        mediaType = 'audio';
        messageContent = '[Audio message]';
        break;

      case 'video':
        mediaUrl = video?.link || '';
        mediaType = 'video';
        messageContent = video?.caption || '[Video]';
        break;

      case 'button':
        messageContent = button?.text || '[Button response]';
        break;

      case 'interactive':
        if (interactive?.type === 'button_reply') {
          messageContent = interactive.button_reply?.title || '[Button reply]';
        } else if (interactive?.type === 'list_reply') {
          messageContent = interactive.list_reply?.title || '[List reply]';
        } else {
          messageContent = '[Interactive message]';
        }
        break;

      default:
        messageContent = `[${type} message]`;
    }

    // Find or create contact
    let contact = null;
    try {
      const contacts = await pb.collection('contacts').getFullList({
        filter: `whatsapp_phone = "${from}"`,
      });
      contact = contacts.length > 0 ? contacts[0] : null;
    } catch (error) {
      logger.warn('Failed to fetch contact', error);
    }

    if (!contact) {
      try {
        contact = await pb.collection('contacts').create({
          whatsapp_phone: from,
          channel: 'whatsapp',
          created_at: new Date().toISOString(),
        });
        logger.info('New contact created from WhatsApp message', { contactId: contact.id, phone: from });
      } catch (error) {
        logger.error('Failed to create contact', error);
        // Continue processing even if contact creation fails
      }
    }

    // Find or create conversation
    let conversation = null;
    if (contact) {
      try {
        const conversations = await pb.collection('conversations').getFullList({
          filter: `contact_id = "${contact.id}" && channel = "whatsapp"`,
        });
        conversation = conversations.length > 0 ? conversations[0] : null;
      } catch (error) {
        logger.warn('Failed to fetch conversation', error);
      }

      if (!conversation) {
        try {
          conversation = await pb.collection('conversations').create({
            contact_id: contact.id,
            channel: 'whatsapp',
            status: 'open',
            created_at: new Date().toISOString(),
          });
          logger.info('New conversation created from WhatsApp message', {
            conversationId: conversation.id,
            contactId: contact.id,
          });
        } catch (error) {
          logger.error('Failed to create conversation', error);
        }
      }
    }

    // Create message record
    if (conversation) {
      try {
        const messageRecord = await pb.collection('messages').create({
          conversation_id: conversation.id,
          contact_id: contact.id,
          channel: 'whatsapp',
          provider: 'whatsapp',
          provider_message_id: messageId,
          from,
          content: messageContent,
          message_type: type,
          media_url: mediaUrl,
          media_type: mediaType,
          direction: 'inbound',
          status: 'received',
          received_at: new Date(parseInt(timestamp) * 1000).toISOString(),
        });

        // Update conversation last_message_at
        await pb.collection('conversations').update(conversation.id, {
          last_message_at: new Date().toISOString(),
          unread_count: (conversation.unread_count || 0) + 1,
        });

        logger.info('WhatsApp message processed and stored', {
          messageId: messageRecord.id,
          conversationId: conversation.id,
          type,
        });
      } catch (error) {
        logger.error('Failed to create message record', error);
      }
    }
  } catch (error) {
    logger.error('Error processing incoming WhatsApp message', error);
    // Don't throw - continue processing other messages
  }
}

/**
 * Process WhatsApp message status update
 * @param {Object} status - Status object from webhook
 * @param {Object} value - Webhook value object containing metadata
 */
async function processStatusUpdate(status, value) {
  try {
    const { id: messageId, status: statusValue, timestamp, recipient_id } = status;

    if (!messageId || !statusValue) {
      logger.warn('WhatsApp status update: missing required fields', { messageId, statusValue });
      return;
    }

    logger.info('WhatsApp message status update', {
      messageId,
      status: statusValue,
      recipientId: recipient_id,
      timestamp,
    });

    // Find and update message record
    try {
      const messages = await pb.collection('messages').getFullList({
        filter: `provider_message_id = "${messageId}"`,
      });

      if (messages.length > 0) {
        const message = messages[0];
        const statusMap = {
          sent: 'sent',
          delivered: 'delivered',
          read: 'read',
          failed: 'failed',
        };

        const mappedStatus = statusMap[statusValue] || statusValue;

        await pb.collection('messages').update(message.id, {
          status: mappedStatus,
          updated_at: new Date().toISOString(),
        });

        logger.info('Message status updated', {
          messageId: message.id,
          status: mappedStatus,
        });
      }
    } catch (error) {
      logger.error('Failed to update message status', error);
    }
  } catch (error) {
    logger.error('Error processing WhatsApp status update', error);
    // Don't throw - continue processing other status updates
  }
}

export default router;