import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { TelephonyFactory } from '../services/telephony/factory.js';
import telephonyConfig from '../config/telephonyConfig.js';

const router = express.Router();

// Initialize telephony provider
let telephonyProvider = null;

(async () => {
  try {
    const activeProvider = telephonyConfig.activeProvider;
    const providerConfig = telephonyConfig.providers[activeProvider];

    if (!providerConfig || !providerConfig.enabled) {
      logger.warn(`Telephony provider ${activeProvider} is not enabled`);
      return;
    }

    telephonyProvider = await TelephonyFactory.createProvider(activeProvider, providerConfig);
    logger.info(`Telephony provider initialized: ${activeProvider}`);
  } catch (error) {
    logger.error(`Failed to initialize telephony provider: ${error.message}`);
  }
})();

// POST /telephony/incoming-call - Handle incoming call webhook
router.post('/incoming-call', async (req, res) => {
  if (!telephonyProvider) {
    throw new Error('Telephony provider not initialized');
  }

  const callData = await telephonyProvider.handleIncomingCall(req.body);

  // Broadcast incoming call event
  if (global.io) {
    global.io.of('/call-centre').emit('call:incoming', {
      callId: callData.id,
      callerId: callData.callerId,
      customerId: callData.customerId,
      timestamp: new Date().toISOString(),
    });
  }

  logger.info(`Incoming call processed: ${callData.id}`);

  res.json({
    success: true,
    callId: callData.id,
    message: 'Incoming call processed',
  });
});

// POST /telephony/call-status - Update call status
router.post('/call-status', async (req, res) => {
  if (!telephonyProvider) {
    throw new Error('Telephony provider not initialized');
  }

  const { CallSid, CallStatus, CallDuration, RecordingUrl } = req.body;

  if (!CallSid || !CallStatus) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: CallSid, CallStatus',
    });
  }

  // Find call by provider call ID
  const calls = await pb.collection('calls').getFullList({
    filter: `provider_call_id = "${CallSid}"`,
  });

  if (calls.length === 0) {
    throw new Error(`Call not found for provider ID: ${CallSid}`);
  }

  const call = calls[0];

  // Update call status
  await telephonyProvider.updateCallStatus(call.id, CallStatus, {
    duration: CallDuration,
    recordingUrl: RecordingUrl,
  });

  logger.info(`Call status updated: ${call.id} -> ${CallStatus}`);

  res.json({
    success: true,
    callId: call.id,
    status: CallStatus,
    timestamp: new Date().toISOString(),
  });
});

// POST /telephony/recording - Handle recording webhook
router.post('/recording', async (req, res) => {
  if (!telephonyProvider) {
    throw new Error('Telephony provider not initialized');
  }

  const { CallSid, RecordingUrl, RecordingDuration } = req.body;

  if (!CallSid || !RecordingUrl) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: CallSid, RecordingUrl',
    });
  }

  // Find call by provider call ID
  const calls = await pb.collection('calls').getFullList({
    filter: `provider_call_id = "${CallSid}"`,
  });

  if (calls.length === 0) {
    throw new Error(`Call not found for provider ID: ${CallSid}`);
  }

  const call = calls[0];

  // Update call with recording URL
  await pb.collection('calls').update(call.id, {
    recording_url: RecordingUrl,
    recording_duration: RecordingDuration || 0,
    recording_received_at: new Date().toISOString(),
  });

  // Broadcast recording event
  if (global.io) {
    global.io.of('/call-centre').emit('call:recording', {
      callId: call.id,
      recordingUrl: RecordingUrl,
      duration: RecordingDuration,
      timestamp: new Date().toISOString(),
    });
  }

  logger.info(`Recording received: ${call.id}`);

  res.json({
    success: true,
    callId: call.id,
    recordingUrl: RecordingUrl,
    timestamp: new Date().toISOString(),
  });
});

// POST /telephony/dtmf - Handle DTMF input
router.post('/dtmf', async (req, res) => {
  const { CallSid, Digits } = req.body;

  if (!CallSid || !Digits) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: CallSid, Digits',
    });
  }

  // Find call by provider call ID
  const calls = await pb.collection('calls').getFullList({
    filter: `provider_call_id = "${CallSid}"`,
  });

  if (calls.length === 0) {
    throw new Error(`Call not found for provider ID: ${CallSid}`);
  }

  const call = calls[0];

  // Broadcast DTMF input event
  if (global.io) {
    global.io.of('/call-centre').emit('dtmf:input', {
      callId: call.id,
      digits: Digits,
      timestamp: new Date().toISOString(),
    });
  }

  logger.info(`DTMF input received: ${call.id} - ${Digits}`);

  res.json({
    success: true,
    callId: call.id,
    digits: Digits,
    timestamp: new Date().toISOString(),
  });
});

// POST /telephony/initiate-call - Initiate outbound call
router.post('/initiate-call', async (req, res) => {
  if (!telephonyProvider) {
    throw new Error('Telephony provider not initialized');
  }

  const { phoneNumber, customerId, agentId } = req.body;

  if (!phoneNumber || !customerId || !agentId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: phoneNumber, customerId, agentId',
    });
  }

  // Initiate call
  const callData = await telephonyProvider.initiateCall({
    phoneNumber,
    customerId,
    agentId,
    callbackUrl: telephonyConfig.webhooks.callStatus,
  });

  // Broadcast call initiated event
  if (global.io) {
    global.io.of('/call-centre').emit('call:initiated', {
      callId: callData.callId,
      phoneNumber,
      customerId,
      agentId,
      timestamp: new Date().toISOString(),
    });
  }

  logger.info(`Call initiated: ${callData.callId}`);

  res.json({
    success: true,
    callId: callData.callId,
    status: callData.status,
    timestamp: new Date().toISOString(),
  });
});

export default router;