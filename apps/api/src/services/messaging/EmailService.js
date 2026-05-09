import 'dotenv/config';
import nodemailer from 'nodemailer';
import { MessageProvider } from './MessageProvider.js';
import pb from '../../utils/pocketbaseClient.js';
import logger from '../../utils/logger.js';

/**
 * Email Service implementation
 * Handles email messaging via SMTP
 */
export class EmailService extends MessageProvider {
  constructor() {
    super();
    this.transporter = null;
    this.fromEmail = null;
  }

  /**
   * Initialize Email service with SMTP configuration
   */
  async initialize(config) {
    if (!config.smtpHost || !config.smtpPort || !config.smtpUser || !config.smtpPassword) {
      throw new Error('Email configuration missing: smtpHost, smtpPort, smtpUser, smtpPassword required');
    }

    this.fromEmail = config.fromEmail || config.smtpUser;

    this.transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure !== false,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPassword,
      },
    });

    logger.info('Email service initialized successfully');
  }

  /**
   * Send email message
   */
  async sendMessage(to, message, metadata = {}) {
    if (!to || !message) {
      throw new Error('Email address and message content are required');
    }

    const mailOptions = {
      from: this.fromEmail,
      to,
      subject: metadata.subject || 'Message',
      html: message,
      text: metadata.text || message,
    };

    const info = await this.transporter.sendMail(mailOptions);

    // Create message record in database
    const messageRecord = await pb.collection('email_notifications').create({
      channel: 'email',
      provider: 'email',
      provider_message_id: info.messageId,
      to,
      content: message,
      direction: 'outbound',
      status: 'sent',
      sent_at: new Date().toISOString(),
      metadata: JSON.stringify(metadata),
    });

    logger.info(`Email sent: ${messageRecord.id} to ${to}`);

    return {
      messageId: messageRecord.id,
      providerMessageId: info.messageId,
      status: 'sent',
      sentAt: messageRecord.sent_at,
    };
  }

  /**
   * Handle incoming email webhook
   */
  async handleIncomingMessage(webhookData) {
    const { from, to, subject, text, html, messageId, timestamp } = webhookData;

    if (!from || !text) {
      throw new Error('Invalid webhook data: from, text required');
    }

    // Find or create contact
    let contact = null;
    try {
      const contacts = await pb.collection('contacts').getFullList({
        filter: `email = "${from}"`,
      });
      contact = contacts.length > 0 ? contacts[0] : null;
    } catch (error) {
      logger.warn(`Could not fetch contact for ${from}`);
    }

    if (!contact) {
      contact = await pb.collection('contacts').create({
        email: from,
        channel: 'email',
        created_at: new Date().toISOString(),
      });
    }

    // Find or create conversation
    let conversation = null;
    try {
      const conversations = await pb.collection('conversations').getFullList({
        filter: `contact_id = "${contact.id}" && channel = "email"`,
      });
      conversation = conversations.length > 0 ? conversations[0] : null;
    } catch (error) {
      logger.warn(`Could not fetch conversation for contact ${contact.id}`);
    }

    if (!conversation) {
      conversation = await pb.collection('conversations').create({
        contact_id: contact.id,
        channel: 'email',
        status: 'open',
        created_at: new Date().toISOString(),
      });
    }

    // Create message record
    const messageRecord = await pb.collection('email_notifications').create({
      conversation_id: conversation.id,
      contact_id: contact.id,
      channel: 'email',
      provider: 'email',
      provider_message_id: messageId,
      from,
      subject,
      content: html || text,
      direction: 'inbound',
      status: 'received',
      received_at: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
    });

    // Update conversation last message
    await pb.collection('conversations').update(conversation.id, {
      last_message_at: messageRecord.received_at,
      unread_count: (conversation.unread_count || 0) + 1,
    });

    logger.info(`Email received: ${messageRecord.id} from ${from}`);

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

    const message = await pb.collection('email_notifications').getOne(messageId);

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

    const messages = await pb.collection('email_notifications').getFullList({
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

    const message = await pb.collection('email_notifications').getOne(messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    const updateData = { status };

    if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    } else if (status === 'read') {
      updateData.read_at = new Date().toISOString();
    }

    const updatedMessage = await pb.collection('email_notifications').update(messageId, updateData);

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

    const message = await pb.collection('email_notifications').getOne(messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    await pb.collection('email_notifications').delete(messageId);

    logger.info(`Message deleted: ${messageId}`);

    return {
      success: true,
      messageId,
    };
  }
}

export default new EmailService();