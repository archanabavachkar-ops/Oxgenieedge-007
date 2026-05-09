import express from 'express';
import MessageFactory from '../services/messaging/MessageFactory.js';
import UnifiedInboxService from '../services/messaging/UnifiedInboxService.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /messaging/send - Send a message
 */
router.post('/send', async (req, res) => {
  const { to, message, conversationId, customerId, channel, agentId } = req.body;

  if (!to || !message || !channel) {
    return res.status(400).json({
      error: 'Missing required fields: to, message, channel',
    });
  }

  // Create provider based on channel
  const provider = await MessageFactory.createProvider(channel, {});

  // Send message
  const result = await provider.sendMessage(to, message, {
    conversationId,
    customerId,
    agentId,
  });

  logger.info(`Message sent via ${channel}: ${result.messageId}`);

  res.status(201).json({
    success: true,
    messageId: result.messageId,
    status: result.status,
  });
});

/**
 * GET /messaging/conversations - Get conversations for agent
 */
router.get('/conversations', async (req, res) => {
  const { agentId, channel, status, limit, offset } = req.query;

  if (!agentId) {
    return res.status(400).json({
      error: 'Missing required parameter: agentId',
    });
  }

  const conversations = await UnifiedInboxService.getConversations(agentId, {
    channel,
    status,
    limit: limit ? parseInt(limit) : 20,
    offset: offset ? parseInt(offset) : 0,
  });

  logger.info(`Conversations retrieved for agent ${agentId}: ${conversations.length}`);

  res.json({
    success: true,
    conversations,
    count: conversations.length,
  });
});

/**
 * GET /messaging/conversations/:id - Get single conversation
 */
router.get('/conversations/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      error: 'Missing required parameter: id',
    });
  }

  const conversation = await UnifiedInboxService.getConversation(id);

  logger.info(`Conversation retrieved: ${id}`);

  res.json({
    success: true,
    conversation,
  });
});

/**
 * POST /messaging/conversations/:id/assign - Assign conversation to agent
 */
router.post('/conversations/:id/assign', async (req, res) => {
  const { id } = req.params;
  const { agentId } = req.body;

  if (!id || !agentId) {
    return res.status(400).json({
      error: 'Missing required fields: id (param), agentId (body)',
    });
  }

  const result = await UnifiedInboxService.assignConversation(id, agentId);

  logger.info(`Conversation assigned: ${id} to agent ${agentId}`);

  res.json({
    success: true,
    conversation: result,
  });
});

/**
 * POST /messaging/conversations/:id/close - Close conversation
 */
router.post('/conversations/:id/close', async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!id) {
    return res.status(400).json({
      error: 'Missing required parameter: id',
    });
  }

  const result = await UnifiedInboxService.closeConversation(id, reason || '');

  logger.info(`Conversation closed: ${id}`);

  res.json({
    success: true,
    conversation: result,
  });
});

/**
 * POST /messaging/conversations/:id/reopen - Reopen conversation
 */
router.post('/conversations/:id/reopen', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      error: 'Missing required parameter: id',
    });
  }

  const result = await UnifiedInboxService.reopenConversation(id);

  logger.info(`Conversation reopened: ${id}`);

  res.json({
    success: true,
    conversation: result,
  });
});

/**
 * GET /messaging/unread-count/:agentId - Get unread count for agent
 */
router.get('/unread-count/:agentId', async (req, res) => {
  const { agentId } = req.params;

  if (!agentId) {
    return res.status(400).json({
      error: 'Missing required parameter: agentId',
    });
  }

  const result = await UnifiedInboxService.getUnreadCount(agentId);

  logger.info(`Unread count retrieved for agent ${agentId}: ${result.totalUnread}`);

  res.json({
    success: true,
    ...result,
  });
});

/**
 * POST /messaging/conversations/:id/read - Mark conversation as read
 */
router.post('/conversations/:id/read', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      error: 'Missing required parameter: id',
    });
  }

  const result = await UnifiedInboxService.markAsRead(id);

  logger.info(`Conversation marked as read: ${id}`);

  res.json({
    success: true,
  });
});

/**
 * GET /messaging/search - Search conversations
 */
router.get('/search', async (req, res) => {
  const { agentId, query } = req.query;

  if (!agentId || !query) {
    return res.status(400).json({
      error: 'Missing required parameters: agentId, query',
    });
  }

  const results = await UnifiedInboxService.searchConversations(agentId, query);

  logger.info(`Conversations searched: ${agentId} - ${results.length} results`);

  res.json({
    success: true,
    results,
    count: results.length,
  });
});

/**
 * POST /messaging/incoming-sms - SMS webhook handler
 */
router.post('/incoming-sms', async (req, res) => {
  const smsService = await MessageFactory.createProvider('sms', {});
  const result = await smsService.handleIncomingMessage(req.body);

  // Broadcast Socket.io event
  if (global.io) {
    global.io.of('/messaging').emit('messaging:message_received', {
      messageId: result.messageId,
      conversationId: result.conversationId,
      channel: 'sms',
      timestamp: new Date().toISOString(),
    });
  }

  logger.info(`Incoming SMS processed: ${result.messageId}`);

  res.json({
    success: true,
    messageId: result.messageId,
  });
});

/**
 * POST /messaging/incoming-whatsapp - WhatsApp webhook handler
 */
router.post('/incoming-whatsapp', async (req, res) => {
  const whatsappService = await MessageFactory.createProvider('whatsapp', {});
  const result = await whatsappService.handleIncomingMessage(req.body);

  // Broadcast Socket.io event
  if (global.io) {
    global.io.of('/messaging').emit('messaging:message_received', {
      messageId: result.messageId,
      conversationId: result.conversationId,
      channel: 'whatsapp',
      timestamp: new Date().toISOString(),
    });
  }

  logger.info(`Incoming WhatsApp processed: ${result.messageId}`);

  res.json({
    success: true,
    messageId: result.messageId,
  });
});

/**
 * POST /messaging/incoming-email - Email webhook handler
 */
router.post('/incoming-email', async (req, res) => {
  const emailService = await MessageFactory.createProvider('email', {});
  const result = await emailService.handleIncomingMessage(req.body);

  // Broadcast Socket.io event
  if (global.io) {
    global.io.of('/messaging').emit('messaging:message_received', {
      messageId: result.messageId,
      conversationId: result.conversationId,
      channel: 'email',
      timestamp: new Date().toISOString(),
    });
  }

  logger.info(`Incoming email processed: ${result.messageId}`);

  res.json({
    success: true,
    messageId: result.messageId,
  });
});

/**
 * POST /messaging/incoming-chat - Chat message handler
 */
router.post('/incoming-chat', async (req, res) => {
  const { customerId, message, sessionId } = req.body;

  if (!customerId || !message) {
    return res.status(400).json({
      error: 'Missing required fields: customerId, message',
    });
  }

  const chatService = await MessageFactory.createProvider('chat', { io: global.io });
  const result = await chatService.handleIncomingMessage({
    from: customerId,
    message,
    conversationId: sessionId,
  });

  // Broadcast Socket.io event
  if (global.io) {
    global.io.of('/messaging').emit('messaging:message_received', {
      messageId: result.messageId,
      conversationId: result.conversationId,
      channel: 'chat',
      timestamp: new Date().toISOString(),
    });
  }

  logger.info(`Incoming chat processed: ${result.messageId}`);

  res.json({
    success: true,
    messageId: result.messageId,
  });
});

export default router;