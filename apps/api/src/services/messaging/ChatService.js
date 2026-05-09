import 'dotenv/config';
import { MessageProvider } from './MessageProvider.js';
import pb from '../../utils/pocketbaseClient.js';
import logger from '../../utils/logger.js';

/**
 * Chat Service implementation
 * Handles in-app chat messaging with WebSocket support
 */
export class ChatService extends MessageProvider {
  constructor() {
    super();
    this.io = null;
  }

  /**
   * Initialize Chat service
   */
  async initialize(config) {
    this.io = config.io || null;
    logger.info('Chat service initialized successfully');
  }

  /**
   * Send chat message
   */
  async sendMessage(to, message, metadata = {}) {
    if (!to || !message) {
      throw new Error('Recipient and message content are required');
    }

    // Create message record in database
    const messageRecord = await pb.collection('messages').create({
      channel: 'chat',
      provider: 'chat',
      to,
      content: message,
      direction: 'outbound',
      status: 'sent',
      sent_at: new Date().toISOString(),
      metadata: JSON.stringify(metadata),
    });

    // Emit WebSocket event
    if (this.io) {
      this.io.of('/messaging').emit('messaging:message_sent', {
        messageId: messageRecord.id,
        to,
        content: message,
        sentAt: messageRecord.sent_at,
      });
    }

    logger.info(`Chat message sent: ${messageRecord.id} to ${to}`);

    return {
      messageId: messageRecord.id,
      status: 'sent',
      sentAt: messageRecord.sent_at,
    };
  }

  /**
   * Handle incoming chat message
   */
  async handleIncomingMessage(webhookData) {
    const { from, conversationId, message, timestamp } = webhookData;

    if (!from || !message) {
      throw new Error('Invalid webhook data: from, message required');
    }

    // Find or create conversation
    let conversation = null;
    if (conversationId) {
      try {
        conversation = await pb.collection('conversations').getOne(conversationId);
      } catch (error) {
        logger.warn(`Conversation not found: ${conversationId}`);
      }
    }

    if (!conversation) {
      conversation = await pb.collection('conversations').create({
        channel: 'chat',
        status: 'open',
        created_at: new Date().toISOString(),
      });
    }

    // Create message record
    const messageRecord = await pb.collection('messages').create({
      conversation_id: conversation.id,
      channel: 'chat',
      provider: 'chat',
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

    // Emit WebSocket event
    if (this.io) {
      this.io.of('/messaging').emit('messaging:message_received', {
        messageId: messageRecord.id,
        conversationId: conversation.id,
        from,
        content: message,
        receivedAt: messageRecord.received_at,
      });
    }

    logger.info(`Chat message received: ${messageRecord.id} from ${from}`);

    return {
      messageId: messageRecord.id,
      conversationId: conversation.id,
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

    const message = await pb.collection('messages').getOne(messageId);

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

    const messages = await pb.collection('messages').getFullList({
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

    const message = await pb.collection('messages').getOne(messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    const updateData = { status };

    if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    } else if (status === 'read') {
      updateData.read_at = new Date().toISOString();
    }

    const updatedMessage = await pb.collection('messages').update(messageId, updateData);

    // Emit WebSocket event
    if (this.io) {
      this.io.of('/messaging').emit('messaging:message_read', {
        messageId: updatedMessage.id,
        status: updatedMessage.status,
      });
    }

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

    const message = await pb.collection('messages').getOne(messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    await pb.collection('messages').delete(messageId);

    logger.info(`Message deleted: ${messageId}`);

    return {
      success: true,
      messageId,
    };
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId) {
    if (!messageId) {
      throw new Error('Message ID is required');
    }

    const message = await pb.collection('messages').getOne(messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    const updatedMessage = await pb.collection('messages').update(messageId, {
      status: 'read',
      read_at: new Date().toISOString(),
    });

    // Emit WebSocket event
    if (this.io) {
      this.io.of('/messaging').emit('messaging:message_read', {
        messageId: updatedMessage.id,
        readAt: updatedMessage.read_at,
      });
    }

    logger.info(`Message marked as read: ${messageId}`);

    return {
      messageId: updatedMessage.id,
      status: 'read',
    };
  }

  /**
   * Set typing indicator
   */
  async setTypingIndicator(conversationId, isTyping) {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }

    // Emit WebSocket event
    if (this.io) {
      this.io.of('/messaging').emit('messaging:typing', {
        conversationId,
        isTyping,
        timestamp: new Date().toISOString(),
      });
    }

    logger.info(`Typing indicator set: ${conversationId} - ${isTyping}`);

    return {
      conversationId,
      isTyping,
    };
  }
}

export default new ChatService();