import 'dotenv/config';
import axios from 'axios';
import { MessageProvider } from './MessageProvider.js';
import pb from '../../utils/pocketbaseClient.js';
import logger from '../../utils/logger.js';

/**
 * WhatsApp Service implementation
 * Handles WhatsApp messaging via Meta Business API
 */
export class WhatsAppService extends MessageProvider {
  constructor() {
    super();
    this.phoneNumberId = null;
    this.accessToken = null;
    this.businessAccountId = null;
    this.client = null;
  }

  /**
   * Initialize WhatsApp service with API credentials
   */
  async initialize(config) {
    if (!config.phoneNumberId || !config.accessToken) {
      throw new Error('WhatsApp configuration missing: phoneNumberId, accessToken required');
    }

    this.phoneNumberId = config.phoneNumberId;
    this.accessToken = config.accessToken;
    this.businessAccountId = config.businessAccountId || '';

    this.client = axios.create({
      baseURL: 'https://graph.instagram.com/v18.0',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    logger.info('WhatsApp service initialized successfully');
  }

  /**
   * Send WhatsApp message
   */
  async sendMessage(to, message, metadata = {}) {
    if (!to || !message) {
      throw new Error('Phone number and message content are required');
    }

    const response = await this.client.post(`/${this.phoneNumberId}/messages`, {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: {
        body: message,
      },
    });

    const providerMessageId = response.data.messages[0].id;

    // Create message record in database
    const messageRecord = await pb.collection('whatsapp_messages').create({
      channel: 'whatsapp',
      provider: 'whatsapp',
      provider_message_id: providerMessageId,
      to,
      content: message,
      direction: 'outbound',
      status: 'sent',
      sent_at: new Date().toISOString(),
      metadata: JSON.stringify(metadata),
    });

    logger.info(`WhatsApp message sent: ${messageRecord.id} to ${to}`);

    return {
      messageId: messageRecord.id,
      providerMessageId,
      status: 'sent',
      sentAt: messageRecord.sent_at,
    };
  }

  /**
   * Send WhatsApp template message
   */
  async sendTemplateMessage(to, templateName, parameters = []) {
    if (!to || !templateName) {
      throw new Error('Phone number and template name are required');
    }

    const response = await this.client.post(`/${this.phoneNumberId}/messages`, {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: 'en_US',
        },
        parameters: {
          body: {
            parameters: parameters.map((param) => ({ text: param })),
          },
        },
      },
    });

    const providerMessageId = response.data.messages[0].id;

    // Create message record in database
    const messageRecord = await pb.collection('whatsapp_messages').create({
      channel: 'whatsapp',
      provider: 'whatsapp',
      provider_message_id: providerMessageId,
      to,
      content: `Template: ${templateName}`,
      direction: 'outbound',
      status: 'sent',
      sent_at: new Date().toISOString(),
      metadata: JSON.stringify({ templateName, parameters }),
    });

    logger.info(`WhatsApp template sent: ${messageRecord.id} to ${to}`);

    return {
      messageId: messageRecord.id,
      providerMessageId,
      status: 'sent',
      sentAt: messageRecord.sent_at,
    };
  }

  /**
   * Handle incoming WhatsApp webhook
   */
  async handleIncomingMessage(webhookData) {
    const { messages, contacts, statuses } = webhookData.entry[0].changes[0].value;

    if (!messages || messages.length === 0) {
      return { success: true, message: 'No messages to process' };
    }

    const incomingMessage = messages[0];
    const contact = contacts[0];
    const { from, id: messageId, timestamp, text } = incomingMessage;
    const { profile } = contact;

    // Find or create contact
    let contactRecord = null;
    try {
      const contacts = await pb.collection('contacts').getFullList({
        filter: `mobile = "${from}"`,
      });
      contactRecord = contacts.length > 0 ? contacts[0] : null;
    } catch (error) {
      logger.warn(`Could not fetch contact for ${from}`);
    }

    if (!contactRecord) {
      contactRecord = await pb.collection('contacts').create({
        mobile: from,
        name: profile.name || '',
        channel: 'whatsapp',
        created_at: new Date().toISOString(),
      });
    }

    // Find or create conversation
    let conversation = null;
    try {
      const conversations = await pb.collection('conversations').getFullList({
        filter: `contact_id = "${contactRecord.id}" && channel = "whatsapp"`,
      });
      conversation = conversations.length > 0 ? conversations[0] : null;
    } catch (error) {
      logger.warn(`Could not fetch conversation for contact ${contactRecord.id}`);
    }

    if (!conversation) {
      conversation = await pb.collection('conversations').create({
        contact_id: contactRecord.id,
        channel: 'whatsapp',
        status: 'open',
        created_at: new Date().toISOString(),
      });
    }

    // Create message record
    const messageRecord = await pb.collection('whatsapp_messages').create({
      conversation_id: conversation.id,
      contact_id: contactRecord.id,
      channel: 'whatsapp',
      provider: 'whatsapp',
      provider_message_id: messageId,
      from,
      content: text.body,
      direction: 'inbound',
      status: 'received',
      received_at: new Date(parseInt(timestamp) * 1000).toISOString(),
    });

    // Update conversation last message
    await pb.collection('conversations').update(conversation.id, {
      last_message_at: messageRecord.received_at,
      unread_count: (conversation.unread_count || 0) + 1,
    });

    logger.info(`WhatsApp message received: ${messageRecord.id} from ${from}`);

    return {
      messageId: messageRecord.id,
      conversationId: conversation.id,
      contactId: contactRecord.id,
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

    const message = await pb.collection('whatsapp_messages').getOne(messageId);

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

    const messages = await pb.collection('whatsapp_messages').getFullList({
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

    const message = await pb.collection('whatsapp_messages').getOne(messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    const updateData = { status };

    if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    } else if (status === 'read') {
      updateData.read_at = new Date().toISOString();
    }

    const updatedMessage = await pb.collection('whatsapp_messages').update(messageId, updateData);

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

    const message = await pb.collection('whatsapp_messages').getOne(messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    await pb.collection('whatsapp_messages').delete(messageId);

    logger.info(`Message deleted: ${messageId}`);

    return {
      success: true,
      messageId,
    };
  }
}

export default new WhatsAppService();