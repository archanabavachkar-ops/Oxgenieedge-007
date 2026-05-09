import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import * as callCentreService from '../services/callCentreService.js';

const router = express.Router();

// GET /call-centre/calls - Fetch all calls with filters
router.get('/calls', async (req, res) => {
  const { date, agent, status, limit = 20, offset = 0 } = req.query;

  // Build filter
  let filter = '';

  if (date) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    filter += `created >= "${startDate.toISOString()}" && created < "${endDate.toISOString()}"`;
  }

  if (agent) {
    filter += filter ? ` && agent_id = "${agent}"` : `agent_id = "${agent}"`;
  }

  if (status) {
    filter += filter ? ` && status = "${status}"` : `status = "${status}"`;
  }

  // Fetch calls with pagination
  const calls = await pb.collection('calls').getFullList({
    filter: filter || undefined,
    sort: '-created',
    limit: Math.min(parseInt(limit) || 20, 100),
    skip: parseInt(offset) || 0,
  });

  // Get total count
  const allCalls = await pb.collection('calls').getFullList({
    filter: filter || undefined,
  });

  logger.info(`Calls retrieved: ${calls.length} of ${allCalls.length}`);

  res.json({
    success: true,
    calls: calls.map((call) => ({
      id: call.id,
      customer_id: call.customer_id,
      phone_number: call.phone_number,
      agent_id: call.agent_id,
      call_type: call.call_type,
      status: call.status,
      duration: call.duration || 0,
      sentiment: call.sentiment || null,
      created: call.created,
      updated: call.updated,
    })),
    pagination: {
      limit: Math.min(parseInt(limit) || 20, 100),
      offset: parseInt(offset) || 0,
      total: allCalls.length,
      count: calls.length,
    },
  });
});

// GET /call-centre/calls/:id - Fetch single call with details
router.get('/calls/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameter: id',
    });
  }

  const call = await pb.collection('calls').getOne(id);

  if (!call) {
    throw new Error('Call not found');
  }

  logger.info(`Call retrieved: ${id}`);

  res.json({
    success: true,
    call: {
      id: call.id,
      customer_id: call.customer_id,
      phone_number: call.phone_number,
      agent_id: call.agent_id,
      call_type: call.call_type,
      status: call.status,
      duration: call.duration || 0,
      sentiment: call.sentiment || null,
      transcription: call.transcription || null,
      recording_url: call.recording_url || null,
      notes: call.notes || '',
      summary: call.summary || null,
      created: call.created,
      updated: call.updated,
    },
  });
});

// POST /call-centre/calls - Create new call
router.post('/calls', async (req, res) => {
  const { customer_id, phone_number, call_type } = req.body;

  if (!customer_id || !phone_number || !call_type) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: customer_id, phone_number, call_type',
    });
  }

  const callId = await callCentreService.initializeCall(customer_id, phone_number, call_type);

  const call = await pb.collection('calls').getOne(callId);

  logger.info(`Call created: ${callId}`);

  res.status(201).json({
    success: true,
    call: {
      id: call.id,
      customer_id: call.customer_id,
      phone_number: call.phone_number,
      call_type: call.call_type,
      status: call.status,
      created: call.created,
    },
  });
});

// PUT /call-centre/calls/:id - Update call
router.put('/calls/:id', async (req, res) => {
  const { id } = req.params;
  const { notes, status, sentiment } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameter: id',
    });
  }

  const call = await pb.collection('calls').getOne(id);

  if (!call) {
    throw new Error('Call not found');
  }

  // Build update data
  const updateData = {};
  if (notes !== undefined) updateData.notes = notes;
  if (status !== undefined) {
    updateData.status = status;
    await callCentreService.updateCallStatus(id, status);
  }
  if (sentiment !== undefined) updateData.sentiment = sentiment;

  const updatedCall = await pb.collection('calls').update(id, updateData);

  logger.info(`Call updated: ${id}`);

  res.json({
    success: true,
    call: {
      id: updatedCall.id,
      customer_id: updatedCall.customer_id,
      phone_number: updatedCall.phone_number,
      status: updatedCall.status,
      notes: updatedCall.notes,
      sentiment: updatedCall.sentiment,
      updated: updatedCall.updated,
    },
  });
});

// GET /call-centre/conversations - Fetch all conversations with filters
router.get('/conversations', async (req, res) => {
  const { customer, agent, channel, limit = 20, offset = 0 } = req.query;

  // Build filter
  let filter = '';

  if (customer) {
    filter += `customer_id = "${customer}"`;
  }

  if (agent) {
    filter += filter ? ` && agent_id = "${agent}"` : `agent_id = "${agent}"`;
  }

  if (channel) {
    filter += filter ? ` && channel = "${channel}"` : `channel = "${channel}"`;
  }

  // Fetch conversations with pagination
  const conversations = await pb.collection('conversations').getFullList({
    filter: filter || undefined,
    sort: '-updated',
    limit: Math.min(parseInt(limit) || 20, 100),
    skip: parseInt(offset) || 0,
  });

  // Get total count
  const allConversations = await pb.collection('conversations').getFullList({
    filter: filter || undefined,
  });

  logger.info(`Conversations retrieved: ${conversations.length} of ${allConversations.length}`);

  res.json({
    success: true,
    conversations: conversations.map((conv) => ({
      id: conv.id,
      customer_id: conv.customer_id,
      agent_id: conv.agent_id,
      channel: conv.channel,
      status: conv.status,
      message_count: conv.message_count || 0,
      last_message_at: conv.last_message_at,
      created: conv.created,
      updated: conv.updated,
    })),
    pagination: {
      limit: Math.min(parseInt(limit) || 20, 100),
      offset: parseInt(offset) || 0,
      total: allConversations.length,
      count: conversations.length,
    },
  });
});

// GET /call-centre/conversations/:id - Fetch conversation with messages
router.get('/conversations/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameter: id',
    });
  }

  const conversation = await pb.collection('conversations').getOne(id);

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  // Fetch all messages for this conversation
  const messages = await pb.collection('messages').getFullList({
    filter: `conversation_id = "${id}"`,
    sort: 'created',
  });

  logger.info(`Conversation retrieved: ${id} with ${messages.length} messages`);

  res.json({
    success: true,
    conversation: {
      id: conversation.id,
      customer_id: conversation.customer_id,
      agent_id: conversation.agent_id,
      channel: conversation.channel,
      status: conversation.status,
      created: conversation.created,
      updated: conversation.updated,
    },
    messages: messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      sender_id: msg.sender_id,
      sender_type: msg.sender_type,
      channel: msg.channel,
      created: msg.created,
    })),
    message_count: messages.length,
  });
});

// POST /call-centre/messages - Create new message
router.post('/messages', async (req, res) => {
  const { conversation_id, content, channel } = req.body;

  if (!conversation_id || !content || !channel) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: conversation_id, content, channel',
    });
  }

  const messageId = await callCentreService.addMessage(conversation_id, content, channel);

  const message = await pb.collection('messages').getOne(messageId);

  logger.info(`Message created: ${messageId}`);

  res.status(201).json({
    success: true,
    message: {
      id: message.id,
      conversation_id: message.conversation_id,
      content: message.content,
      channel: message.channel,
      created: message.created,
    },
  });
});

// GET /call-centre/credits - Fetch user's credit usage
router.get('/credits', async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameter: user_id',
    });
  }

  // Fetch user credits record
  const credits = await pb.collection('user_credits').getFullList({
    filter: `user_id = "${user_id}"`,
  });

  if (credits.length === 0) {
    throw new Error('User credits not found');
  }

  const userCredits = credits[0];

  logger.info(`Credits retrieved for user: ${user_id}`);

  res.json({
    success: true,
    credits: {
      user_id: userCredits.user_id,
      sms_used: userCredits.sms_used || 0,
      sms_limit: userCredits.sms_limit || 1000,
      calls_used: userCredits.calls_used || 0,
      calls_limit: userCredits.calls_limit || 500,
      whatsapp_used: userCredits.whatsapp_used || 0,
      whatsapp_limit: userCredits.whatsapp_limit || 500,
      email_used: userCredits.email_used || 0,
      email_limit: userCredits.email_limit || 5000,
      sms_remaining: (userCredits.sms_limit || 1000) - (userCredits.sms_used || 0),
      calls_remaining: (userCredits.calls_limit || 500) - (userCredits.calls_used || 0),
      whatsapp_remaining: (userCredits.whatsapp_limit || 500) - (userCredits.whatsapp_used || 0),
      email_remaining: (userCredits.email_limit || 5000) - (userCredits.email_used || 0),
    },
  });
});

// POST /call-centre/credits/deduct - Deduct credits
router.post('/credits/deduct', async (req, res) => {
  const { user_id, credit_type, amount } = req.body;

  if (!user_id || !credit_type || amount === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: user_id, credit_type, amount',
    });
  }

  const updatedCredits = await callCentreService.deductCredits(user_id, credit_type, amount);

  logger.info(`Credits deducted for user ${user_id}: ${credit_type} - ${amount}`);

  res.json({
    success: true,
    credits: updatedCredits,
  });
});

export default router;