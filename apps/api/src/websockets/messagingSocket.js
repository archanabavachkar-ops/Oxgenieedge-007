import logger from '../utils/logger.js';

/**
 * Messaging WebSocket event handlers
 * Manages real-time communication for unified inbox
 */
export default (io) => {
  const messagingNamespace = io.of('/messaging');

  messagingNamespace.on('connection', (socket) => {
    logger.info(`Client connected to messaging namespace: ${socket.id}`);

    // Handle message:sent event
    socket.on('messaging:message_sent', (data) => {
      logger.info(`Message sent: ${data.messageId}`);

      messagingNamespace.emit('messaging:message_sent', {
        messageId: data.messageId,
        conversationId: data.conversationId,
        channel: data.channel,
        sentAt: new Date().toISOString(),
      });
    });

    // Handle message:received event
    socket.on('messaging:message_received', (data) => {
      logger.info(`Message received: ${data.messageId}`);

      messagingNamespace.emit('messaging:message_received', {
        messageId: data.messageId,
        conversationId: data.conversationId,
        channel: data.channel,
        from: data.from,
        content: data.content,
        receivedAt: new Date().toISOString(),
      });
    });

    // Handle message:read event
    socket.on('messaging:message_read', (data) => {
      logger.info(`Message read: ${data.messageId}`);

      messagingNamespace.emit('messaging:message_read', {
        messageId: data.messageId,
        conversationId: data.conversationId,
        readAt: new Date().toISOString(),
      });
    });

    // Handle typing indicator
    socket.on('messaging:typing', (data) => {
      logger.info(`Typing indicator: ${data.conversationId}`);

      messagingNamespace.emit('messaging:typing', {
        conversationId: data.conversationId,
        agentId: data.agentId,
        isTyping: data.isTyping,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle conversation:assigned event
    socket.on('messaging:conversation_assigned', (data) => {
      logger.info(`Conversation assigned: ${data.conversationId}`);

      messagingNamespace.emit('messaging:conversation_assigned', {
        conversationId: data.conversationId,
        agentId: data.agentId,
        assignedAt: new Date().toISOString(),
      });
    });

    // Handle conversation:closed event
    socket.on('messaging:conversation_closed', (data) => {
      logger.info(`Conversation closed: ${data.conversationId}`);

      messagingNamespace.emit('messaging:conversation_closed', {
        conversationId: data.conversationId,
        reason: data.reason,
        closedAt: new Date().toISOString(),
      });
    });

    // Handle conversation:reopened event
    socket.on('messaging:conversation_reopened', (data) => {
      logger.info(`Conversation reopened: ${data.conversationId}`);

      messagingNamespace.emit('messaging:conversation_reopened', {
        conversationId: data.conversationId,
        reopenedAt: new Date().toISOString(),
      });
    });

    // Handle unread:count_updated event
    socket.on('messaging:unread_count_updated', (data) => {
      logger.info(`Unread count updated: ${data.conversationId}`);

      messagingNamespace.emit('messaging:unread_count_updated', {
        conversationId: data.conversationId,
        unreadCount: data.unreadCount,
        agentId: data.agentId,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle agent:join event
    socket.on('agent:join', (data) => {
      logger.info(`Agent joined: ${data.agentId}`);

      socket.join(`agent:${data.agentId}`);
      socket.join('agents');

      messagingNamespace.emit('agent:online', {
        agentId: data.agentId,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle agent:leave event
    socket.on('agent:leave', (data) => {
      logger.info(`Agent left: ${data.agentId}`);

      socket.leave(`agent:${data.agentId}`);
      socket.leave('agents');

      messagingNamespace.emit('agent:offline', {
        agentId: data.agentId,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle customer:join event
    socket.on('customer:join', (data) => {
      logger.info(`Customer joined: ${data.customerId}`);

      socket.join(`customer:${data.customerId}`);
      socket.join('customers');
    });

    // Handle customer:leave event
    socket.on('customer:leave', (data) => {
      logger.info(`Customer left: ${data.customerId}`);

      socket.leave(`customer:${data.customerId}`);
      socket.leave('customers');
    });

    // Handle disconnect event
    socket.on('disconnect', () => {
      logger.info(`Client disconnected from messaging namespace: ${socket.id}`);
    });
  });

  return messagingNamespace;
};