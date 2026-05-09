import 'dotenv/config';
import axios from 'axios';
import { MessageProvider } from './MessageProvider.js';
import pb from '../../utils/pocketbaseClient.js';
import logger from '../../utils/logger.js';

/**
 * SMS Service implementation
 * Handles SMS messaging via provider API
 */
export class SMSService extends MessageProvider {
  constructor() {
    super();
    this.apiKey = null;
    this.senderId = null;
    this.baseUrl = null;
    this.client = null;
  }

  /**
   * Initialize SMS service with API credentials
   */
  async initialize(config) {
    if (!config.apiKey || !config.baseUrl) {
      throw new Error('SMS configuration missing: apiKey, baseUrl required');
    }

    this.apiKey = config.apiKey;
    this.senderId = config.senderId || 'SENDER';
    this.baseUrl = config.baseUrl;

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    logger.info('SMS service initialized successfully');
  }

  /**
   * Send SMS message
   */
  async sendMessage(to, message, metadata = {}) {
    if (!to || !message) {
      throw new Error('Phone number and message content are required');
    }

    // Call SMS provider API
    const response = await this.client.post('/send', {
      to,
      message,
      senderId: this.senderId,
      ...metadata,
    });

    const providerMessageId = response.data.messageId || response.data.id;

    // Create message record in database
    const messageRecord = await pb.collection('sms_messages').create({
      channel: 'sms',
      provider: 'sms',
      provider_message_id: providerMessageId,
      to,
      content: message,
      direction: 'outbound',
      status: 'sent',
      sent_at: new Date().toISOString(),
      metadata: JSON.stringify(metadata),
    });

    logger.info(`SMS sent: ${messageRecord.id} to ${to}`);

    return {
      messageId: messageRecord.id,
      providerMessageId,
      status: 'sent',
      sentAt: messageRecord.sent_at,
    };
  }

  /**
   * Handle incoming SMS webhook
   */
  async handleIncomingMessage(webhookData) {
    const { from, message, messageId, timestamp } = webhookData;

    if (!from || !message) {
      throw new Error('Invalid webhook data: from, message required');
    }

    // Find or create contact
    let contact = null;
    try {
      const contacts = await pb.collection('contacts').getFullList({
        filter: `mobile = "${from}"`,
      });
      contact = contacts.length > 0 ? contacts[0] : null;
    } catch (error) {
      logger.warn(`Could not fetch contact for ${from}`);
    }

    if (!contact) {
      contact = await pb.collection('contacts').create({
        mobile: from,
        channel: 'sms',
        created_at: new Date().toISOString(),
      });
    }

    // Find or create conversation
    let conversation = null;
    try {
      const conversations = await pb.collection('conversations').getFullList({
        filter: `contact_id = "${contact.id}" && channel = "sms"`,
      });
      conversation = conversations.length > 0 ? conversations[0] : null;
    } catch (error) {
      logger.warn(`Could not fetch conversation for contact ${contact.id}`);
    }

    if (!conversation) {
      conversation = await pb.collection('conversations').create({
        contact_id: contact.id,
        channel: 'sms',
        status: 'open',
        created_at: new Date().toISOString(),
      });
    }

    // Create message record
    const messageRecord = await pb.collection('sms_messages').create({
      conversation_id: conversation.id,
      contact_id: contact.id,
      channel: 'sms',
      provider: 'sms',
      provider_message_id: messageId,
      from,
      content: message,
      direction: 'inbound',
      status: 'received',
      received_at: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
    });

    // Update conversation last message
    await pb.collection('conversations').update(conversation.id, {
      last_message_at: messageRecord.received_at,
      unread_count: (conversation.unread_count || 0) + 1,
    });

    logger.info(`SMS received: ${messageRecord.id} from ${from}`);

    return {
      messageId: messageRecord.id,
      conversationId: conversation.id,
      contactId: contact.id,
      status: 'received',
    };
  }

  /**
   * Get message status
   */
  async getMessageStatus(messageId) {
    if (!messageId) {
      throw new Error('Message ID is required');
    }

    const message = await pb.collection('sms_messages').getOne(messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    logger.info(`Message status retrieved: ${messageId}`);

    return {
      messageId,
      status: message.status,
      sentAt: message.sent_at,
      deliveredAt: message.delivered_at || null,
      readAt: message.read_at || null,
    };
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(conversationId, options = {}) {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }

    const limit = Math.min(options.limit || 50, 100);
    const offset = options.offset || 0;

    const messages = await pb.collection('sms_messages').getFullList({
      filter: `conversation_id = "${conversationId}"`,
      sort: '-received_at',
      limit,
      skip: offset,
    });

    logger.info(`Conversation history retrieved: ${conversationId} - ${messages.length} messages`);

    return messages.map((msg) => ({
      messageId: msg.id,
      conversationId: msg.conversation_id,
      content: msg.content,
      direction: msg.direction,
      status: msg.status,
      sentAt: msg.sent_at,
      receivedAt: msg.received_at,
    }));
  }

  /**
   * Update message status
   */
  async updateMessageStatus(messageId, status) {
    if (!messageId || !status) {
      throw new Error('Message ID and status are required');
    }

    const message = await pb.collection('sms_messages').getOne(messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    const updateData = { status };

    if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    } else if (status === 'read') {
      updateData.read_at = new Date().toISOString();
    }

    const updatedMessage = await pb.collection('sms_messages').update(messageId, updateData);

    logger.info(`Message status updated: ${messageId} -> ${status}`);

    return {
      messageId: updatedMessage.id,
      status: updatedMessage.status,
    };
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId) {
    if (!messageId) {
      throw new Error('Message ID is required');
    }

    const message = await pb.collection('sms_messages').getOne(messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    await pb.collection('sms_messages').delete(messageId);

    logger.info(`Message deleted: ${messageId}`);

    return {
      success: true,
      messageId,
    };
  }
}

export default new SMSService();