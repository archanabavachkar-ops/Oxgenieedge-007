import 'dotenv/config';
import pb from '../../utils/pocketbaseClient.js';
import logger from '../../utils/logger.js';

/**
 * Unified Inbox Service
 * Manages conversations across all messaging channels
 */
export class UnifiedInboxService {
  /**
   * Get conversations for an agent
   */
  async getConversations(agentId, filters = {}) {
    if (!agentId) {
      throw new Error('Agent ID is required');
    }

    let filter = `assigned_agent_id = "${agentId}"`;

    if (filters.channel) {
      filter += ` && channel = "${filters.channel}"`;
    }

    if (filters.status) {
      filter += ` && status = "${filters.status}"`;
    }

    const limit = Math.min(filters.limit || 20, 100);
    const offset = filters.offset || 0;

    const conversations = await pb.collection('conversations').getFullList({
      filter,
      sort: '-last_message_at',
      limit,
      skip: offset,
      expand: 'contact_id',
    });

    logger.info(`Conversations retrieved for agent ${agentId}: ${conversations.length}`);

    return conversations.map((conv) => ({
      conversationId: conv.id,
      contactId: conv.contact_id,
      contactName: conv.expand?.contact_id?.name || 'Unknown',
      channel: conv.channel,
      status: conv.status,
      unreadCount: conv.unread_count || 0,
      lastMessageAt: conv.last_message_at,
      assignedTo: conv.assigned_agent_id,
      createdAt: conv.created_at,
    }));
  }

  /**
   * Get single conversation
   */
  async getConversation(conversationId) {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }

    const conversation = await pb.collection('conversations').getOne(conversationId, {
      expand: 'contact_id',
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Get messages
    const messages = await pb.collection('messages').getFullList({
      filter: `conversation_id = "${conversationId}"`,
      sort: 'received_at',
    });

    logger.info(`Conversation retrieved: ${conversationId}`);

    return {
      conversationId: conversation.id,
      contactId: conversation.contact_id,
      contactName: conversation.expand?.contact_id?.name || 'Unknown',
      channel: conversation.channel,
      status: conversation.status,
      unreadCount: conversation.unread_count || 0,
      assignedTo: conversation.assigned_agent_id,
      createdAt: conversation.created_at,
      messages: messages.map((msg) => ({
        messageId: msg.id,
        content: msg.content,
        direction: msg.direction,
        status: msg.status,
        sentAt: msg.sent_at,
        receivedAt: msg.received_at,
      })),
    };
  }

  /**
   * Assign conversation to agent
   */
  async assignConversation(conversationId, agentId) {
    if (!conversationId || !agentId) {
      throw new Error('Conversation ID and Agent ID are required');
    }

    const conversation = await pb.collection('conversations').getOne(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const updatedConversation = await pb.collection('conversations').update(conversationId, {
      assigned_agent_id: agentId,
      assigned_at: new Date().toISOString(),
    });

    // Broadcast via Socket.io
    if (global.io) {
      global.io.of('/messaging').emit('messaging:conversation_assigned', {
        conversationId: updatedConversation.id,
        agentId,
        assignedAt: updatedConversation.assigned_at,
      });
    }

    logger.info(`Conversation assigned: ${conversationId} to agent ${agentId}`);

    return {
      conversationId: updatedConversation.id,
      assignedTo: updatedConversation.assigned_agent_id,
      assignedAt: updatedConversation.assigned_at,
    };
  }

  /**
   * Close conversation
   */
  async closeConversation(conversationId, reason = '') {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }

    const conversation = await pb.collection('conversations').getOne(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const updatedConversation = await pb.collection('conversations').update(conversationId, {
      status: 'closed',
      closed_at: new Date().toISOString(),
      close_reason: reason,
    });

    // Broadcast via Socket.io
    if (global.io) {
      global.io.of('/messaging').emit('messaging:conversation_closed', {
        conversationId: updatedConversation.id,
        reason,
        closedAt: updatedConversation.closed_at,
      });
    }

    logger.info(`Conversation closed: ${conversationId}`);

    return {
      conversationId: updatedConversation.id,
      status: 'closed',
      closedAt: updatedConversation.closed_at,
    };
  }

  /**
   * Reopen conversation
   */
  async reopenConversation(conversationId) {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }

    const conversation = await pb.collection('conversations').getOne(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const updatedConversation = await pb.collection('conversations').update(conversationId, {
      status: 'open',
      reopened_at: new Date().toISOString(),
    });

    // Broadcast via Socket.io
    if (global.io) {
      global.io.of('/messaging').emit('messaging:conversation_reopened', {
        conversationId: updatedConversation.id,
        reopenedAt: updatedConversation.reopened_at,
      });
    }

    logger.info(`Conversation reopened: ${conversationId}`);

    return {
      conversationId: updatedConversation.id,
      status: 'open',
      reopenedAt: updatedConversation.reopened_at,
    };
  }

  /**
   * Get unread count for agent
   */
  async getUnreadCount(agentId) {
    if (!agentId) {
      throw new Error('Agent ID is required');
    }

    const conversations = await pb.collection('conversations').getFullList({
      filter: `assigned_agent_id = "${agentId}"`,
    });

    const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);

    logger.info(`Unread count retrieved for agent ${agentId}: ${totalUnread}`);

    return {
      agentId,
      totalUnread,
      conversationCount: conversations.length,
    };
  }

  /**
   * Mark conversation as read
   */
  async markAsRead(conversationId) {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }

    const conversation = await pb.collection('conversations').getOne(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Mark all messages as read
    const messages = await pb.collection('messages').getFullList({
      filter: `conversation_id = "${conversationId}" && status != "read"`,
    });

    for (const message of messages) {
      await pb.collection('messages').update(message.id, {
        status: 'read',
        read_at: new Date().toISOString(),
      });
    }

    // Update conversation
    const updatedConversation = await pb.collection('conversations').update(conversationId, {
      unread_count: 0,
    });

    // Broadcast via Socket.io
    if (global.io) {
      global.io.of('/messaging').emit('messaging:unread_count_updated', {
        conversationId: updatedConversation.id,
        unreadCount: 0,
      });
    }

    logger.info(`Conversation marked as read: ${conversationId}`);

    return {
      conversationId: updatedConversation.id,
      unreadCount: 0,
    };
  }

  /**
   * Search conversations
   */
  async searchConversations(agentId, query) {
    if (!agentId || !query) {
      throw new Error('Agent ID and search query are required');
    }

    // Search in messages
    const messages = await pb.collection('messages').getFullList({
      filter: `content ~ "${query}"`,
    });

    const conversationIds = [...new Set(messages.map((msg) => msg.conversation_id))];

    const conversations = await Promise.all(
      conversationIds.map((id) => pb.collection('conversations').getOne(id))
    );

    const filteredConversations = conversations.filter((conv) => conv.assigned_agent_id === agentId);

    logger.info(`Conversations searched: ${agentId} - ${filteredConversations.length} results`);

    return filteredConversations.map((conv) => ({
      conversationId: conv.id,
      contactId: conv.contact_id,
      channel: conv.channel,
      status: conv.status,
      unreadCount: conv.unread_count || 0,
      lastMessageAt: conv.last_message_at,
    }));
  }
}

export default new UnifiedInboxService();