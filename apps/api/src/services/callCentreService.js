import 'dotenv/config';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

// Initialize a new call
export const initializeCall = async (customerId, phoneNumber, callType) => {
  if (!customerId || !phoneNumber || !callType) {
    throw new Error('Missing required parameters: customerId, phoneNumber, callType');
  }

  const callRecord = await pb.collection('calls').create({
    customer_id: customerId,
    phone_number: phoneNumber,
    call_type: callType,
    status: 'initiated',
    duration: 0,
    created_at: new Date().toISOString(),
  });

  logger.info(`Call initialized: ${callRecord.id} for customer ${customerId}`);

  return callRecord.id;
};

// Update call status
export const updateCallStatus = async (callId, status) => {
  if (!callId || !status) {
    throw new Error('Missing required parameters: callId, status');
  }

  const call = await pb.collection('calls').getOne(callId);

  if (!call) {
    throw new Error('Call not found');
  }

  const updatedCall = await pb.collection('calls').update(callId, {
    status,
    updated_at: new Date().toISOString(),
  });

  // Log status change
  await pb.collection('call_logs').create({
    call_id: callId,
    action: 'status_changed',
    old_status: call.status,
    new_status: status,
    timestamp: new Date().toISOString(),
  });

  logger.info(`Call status updated: ${callId} - ${call.status} → ${status}`);

  return updatedCall;
};

// Record call with recording URL
export const recordCall = async (callId, recordingUrl) => {
  if (!callId || !recordingUrl) {
    throw new Error('Missing required parameters: callId, recordingUrl');
  }

  const call = await pb.collection('calls').getOne(callId);

  if (!call) {
    throw new Error('Call not found');
  }

  // Encrypt metadata (placeholder - in production use actual encryption)
  const encryptedMetadata = JSON.stringify({
    recording_url: recordingUrl,
    encrypted_at: new Date().toISOString(),
  });

  const updatedCall = await pb.collection('calls').update(callId, {
    recording_url: recordingUrl,
    recording_metadata: encryptedMetadata,
    updated_at: new Date().toISOString(),
  });

  logger.info(`Call recording saved: ${callId}`);

  return updatedCall;
};

// Transcribe call
export const transcribeCall = async (callId, audioUrl) => {
  if (!callId || !audioUrl) {
    throw new Error('Missing required parameters: callId, audioUrl');
  }

  const call = await pb.collection('calls').getOne(callId);

  if (!call) {
    throw new Error('Call not found');
  }

  // Placeholder for transcription service call
  // In production, this would call a transcription API (e.g., Google Speech-to-Text, AWS Transcribe)
  const transcription = `[Transcription placeholder for ${audioUrl}]`;

  const updatedCall = await pb.collection('calls').update(callId, {
    transcription,
    transcribed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  logger.info(`Call transcribed: ${callId}`);

  return updatedCall;
};

// Generate call summary using AI
export const generateCallSummary = async (callId, transcription) => {
  if (!callId || !transcription) {
    throw new Error('Missing required parameters: callId, transcription');
  }

  const call = await pb.collection('calls').getOne(callId);

  if (!call) {
    throw new Error('Call not found');
  }

  // Placeholder for AI summary generation
  // In production, this would call an AI service (e.g., OpenAI, Google AI)
  const summary = `Summary of call: ${transcription.substring(0, 100)}...`;

  const updatedCall = await pb.collection('calls').update(callId, {
    summary,
    summary_generated_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  logger.info(`Call summary generated: ${callId}`);

  return updatedCall;
};

// Analyze sentiment of transcription
export const analyzeSentiment = async (transcription) => {
  if (!transcription) {
    throw new Error('Missing required parameter: transcription');
  }

  // Placeholder for sentiment analysis
  // In production, this would call a sentiment analysis API
  const sentimentScore = Math.random();
  let sentiment = 'neutral';

  if (sentimentScore > 0.6) {
    sentiment = 'positive';
  } else if (sentimentScore < 0.4) {
    sentiment = 'negative';
  }

  logger.info(`Sentiment analyzed: ${sentiment}`);

  return sentiment;
};

// Create conversation
export const createConversation = async (customerId, channel) => {
  if (!customerId || !channel) {
    throw new Error('Missing required parameters: customerId, channel');
  }

  const conversationRecord = await pb.collection('conversations').create({
    customer_id: customerId,
    channel,
    status: 'active',
    message_count: 0,
    created_at: new Date().toISOString(),
  });

  logger.info(`Conversation created: ${conversationRecord.id} for customer ${customerId}`);

  return conversationRecord.id;
};

// Add message to conversation
export const addMessage = async (conversationId, content, channel) => {
  if (!conversationId || !content || !channel) {
    throw new Error('Missing required parameters: conversationId, content, channel');
  }

  const conversation = await pb.collection('conversations').getOne(conversationId);

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  const messageRecord = await pb.collection('messages').create({
    conversation_id: conversationId,
    content,
    channel,
    sender_type: 'agent',
    created_at: new Date().toISOString(),
  });

  // Update conversation's last_message_at and message_count
  await pb.collection('conversations').update(conversationId, {
    last_message_at: new Date().toISOString(),
    message_count: (conversation.message_count || 0) + 1,
    updated_at: new Date().toISOString(),
  });

  logger.info(`Message added to conversation ${conversationId}: ${messageRecord.id}`);

  return messageRecord.id;
};

// Deduct credits from user
export const deductCredits = async (userId, creditType, amount) => {
  if (!userId || !creditType || amount === undefined) {
    throw new Error('Missing required parameters: userId, creditType, amount');
  }

  // Fetch user credits
  const credits = await pb.collection('user_credits').getFullList({
    filter: `user_id = "${userId}"`,
  });

  if (credits.length === 0) {
    throw new Error('User credits not found');
  }

  const userCredits = credits[0];

  // Check if user has enough credits
  const usedField = `${creditType}_used`;
  const limitField = `${creditType}_limit`;
  const currentUsed = userCredits[usedField] || 0;
  const limit = userCredits[limitField] || 0;

  if (currentUsed + amount > limit) {
    throw new Error(`Insufficient ${creditType} credits. Used: ${currentUsed}, Limit: ${limit}, Requested: ${amount}`);
  }

  // Deduct credits
  const updatedCredits = await pb.collection('user_credits').update(userCredits.id, {
    [usedField]: currentUsed + amount,
    updated_at: new Date().toISOString(),
  });

  logger.info(`Credits deducted for user ${userId}: ${creditType} - ${amount}`);

  return {
    user_id: updatedCredits.user_id,
    sms_used: updatedCredits.sms_used || 0,
    sms_limit: updatedCredits.sms_limit || 1000,
    calls_used: updatedCredits.calls_used || 0,
    calls_limit: updatedCredits.calls_limit || 500,
    whatsapp_used: updatedCredits.whatsapp_used || 0,
    whatsapp_limit: updatedCredits.whatsapp_limit || 500,
    email_used: updatedCredits.email_used || 0,
    email_limit: updatedCredits.email_limit || 5000,
    sms_remaining: (updatedCredits.sms_limit || 1000) - (updatedCredits.sms_used || 0),
    calls_remaining: (updatedCredits.calls_limit || 500) - (updatedCredits.calls_used || 0),
    whatsapp_remaining: (updatedCredits.whatsapp_limit || 500) - (updatedCredits.whatsapp_used || 0),
    email_remaining: (updatedCredits.email_limit || 5000) - (updatedCredits.email_used || 0),
  };
};

// Get agent performance metrics
export const getAgentPerformance = async (agentId, dateRange) => {
  if (!agentId) {
    throw new Error('Missing required parameter: agentId');
  }

  // Build filter
  let filter = `agent_id = "${agentId}"`;

  if (dateRange && dateRange.start && dateRange.end) {
    const startDate = new Date(dateRange.start).toISOString();
    const endDate = new Date(dateRange.end).toISOString();
    filter += ` && created >= "${startDate}" && created <= "${endDate}"`;
  }

  // Fetch agent's calls
  const calls = await pb.collection('calls').getFullList({
    filter,
  });

  // Calculate metrics
  const totalCalls = calls.length;
  const completedCalls = calls.filter((c) => c.status === 'completed').length;
  const totalDuration = calls.reduce((sum, c) => sum + (c.duration || 0), 0);
  const averageDuration = totalCalls > 0 ? totalDuration / totalCalls : 0;

  // Calculate conversion rate (placeholder - would need order data)
  const conversionRate = totalCalls > 0 ? (completedCalls / totalCalls) * 100 : 0;

  // Calculate satisfaction (placeholder - would need survey data)
  const satisfactionScore = 4.5; // Out of 5

  logger.info(`Agent performance retrieved: ${agentId}`);

  return {
    agent_id: agentId,
    calls_handled: totalCalls,
    completed_calls: completedCalls,
    total_duration: totalDuration,
    average_duration: Math.round(averageDuration),
    conversion_rate: Math.round(conversionRate * 100) / 100,
    satisfaction_score: satisfactionScore,
  };
};