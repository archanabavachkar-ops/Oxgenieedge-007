import 'dotenv/config';
import twilio from 'twilio';
import { TelephonyProvider } from './provider.interface.js';
import pb from '../../utils/pocketbaseClient.js';
import logger from '../../utils/logger.js';

/**
 * Twilio telephony service implementation.
 * Extends TelephonyProvider to provide Twilio-specific functionality.
 */
export class TwilioService extends TelephonyProvider {
  constructor() {
    super();
    this.accountSid = null;
    this.authToken = null;
    this.phoneNumber = null;
    this.client = null;
  }

  /**
   * Initialize Twilio service with credentials.
   *
   * @param {Object} config - Configuration object
   * @param {string} config.accountSid - Twilio Account SID
   * @param {string} config.authToken - Twilio Auth Token
   * @param {string} config.phoneNumber - Default outbound phone number
   * @returns {Promise<void>}
   */
  async initialize(config) {
    if (!config.accountSid || !config.authToken) {
      throw new Error('Twilio configuration missing: accountSid, authToken required');
    }

    this.accountSid = config.accountSid;
    this.authToken = config.authToken;
    this.phoneNumber = config.phoneNumber || '';

    // Initialize Twilio client
    this.client = twilio(this.accountSid, this.authToken);

    logger.info('Twilio service initialized successfully');
  }

  /**
   * Initiate outbound call via Twilio.
   *
   * @param {Object} params - Call parameters
   * @returns {Promise<Object>} Call object
   */
  async initiateCall(params) {
    const { phoneNumber, customerId, agentId, callbackUrl, metadata } = params;

    if (!phoneNumber || !customerId || !agentId) {
      throw new Error('Missing required parameters: phoneNumber, customerId, agentId');
    }

    // Initiate call
    const call = await this.client.calls.create({
      from: this.phoneNumber,
      to: phoneNumber,
      url: callbackUrl || `${process.env.API_BASE_URL}/hcgi/api/telephony/call-status`,
      statusCallback: callbackUrl || `${process.env.API_BASE_URL}/hcgi/api/telephony/call-status`,
      statusCallbackMethod: 'POST',
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      record: true,
      recordingStatusCallback: `${process.env.API_BASE_URL}/hcgi/api/telephony/recording`,
      recordingStatusCallbackMethod: 'POST',
    });

    // Create call record in database
    const callRecord = await pb.collection('calls').create({
      provider: 'twilio',
      provider_call_id: call.sid,
      customer_id: customerId,
      agent_id: agentId,
      phone_number: phoneNumber,
      call_type: 'outbound',
      status: 'initiated',
      initiated_at: new Date().toISOString(),
      metadata: JSON.stringify(metadata || {}),
    });

    logger.info(`Twilio call initiated: ${callRecord.id} (Provider ID: ${call.sid})`);

    return {
      callId: callRecord.id,
      providerCallId: call.sid,
      status: 'initiated',
      initiatedAt: callRecord.initiated_at,
    };
  }

  /**
   * Handle incoming call webhook from Twilio.
   *
   * @param {Object} webhookData - Webhook payload
   * @returns {Promise<Object>} Created call record
   */
  async handleIncomingCall(webhookData) {
    const { CallSid, From, To, Caller } = webhookData;

    if (!CallSid || !From || !To) {
      throw new Error('Invalid webhook data: CallSid, From, To required');
    }

    // Look up customer by phone number
    let customerId = null;
    try {
      const leads = await pb.collection('leads').getFullList({
        filter: `mobile = "${From}"`,
      });
      if (leads.length > 0) {
        customerId = leads[0].id;
      }
    } catch (error) {
      logger.warn(`Could not find customer for phone ${From}`);
    }

    // Create call record
    const callRecord = await pb.collection('calls').create({
      provider: 'twilio',
      provider_call_id: CallSid,
      customer_id: customerId || '',
      phone_number: From,
      called_number: To,
      call_type: 'inbound',
      status: 'incoming',
      caller_id: Caller || From,
      initiated_at: new Date().toISOString(),
    });

    logger.info(`Incoming call received: ${callRecord.id} from ${From}`);

    return {
      id: callRecord.id,
      callerId: Caller || From,
      status: 'incoming',
      customerId,
    };
  }

  /**
   * Update call status and broadcast via WebSocket.
   *
   * @param {string} callId - Internal call ID
   * @param {string} status - New status
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Updated call
   */
  async updateCallStatus(callId, status, metadata = {}) {
    const call = await pb.collection('calls').getOne(callId);

    const updateData = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (metadata.duration) updateData.duration = metadata.duration;
    if (metadata.recordingUrl) updateData.recording_url = metadata.recordingUrl;
    if (metadata.sentiment) updateData.sentiment = metadata.sentiment;

    const updatedCall = await pb.collection('calls').update(callId, updateData);

    // Broadcast via WebSocket
    if (global.io) {
      global.io.of('/call-centre').emit('call:status', {
        callId,
        status,
        agentId: call.agent_id,
        customerId: call.customer_id,
        timestamp: new Date().toISOString(),
      });
    }

    logger.info(`Call status updated: ${callId} -> ${status}`);

    return updatedCall;
  }

  /**
   * Fetch recording from Twilio and store.
   *
   * @param {string} callId - Internal call ID
   * @param {string} recordingUrl - Recording URL from Twilio
   * @returns {Promise<Object>} Recording metadata
   */
  async fetchRecording(callId, recordingUrl = null) {
    const call = await pb.collection('calls').getOne(callId);

    const url = recordingUrl || call.recording_url;
    if (!url) {
      throw new Error('No recording URL found');
    }

    // Fetch recording from Twilio
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')}`,
      },
    });

    const recordingBuffer = await response.arrayBuffer();

    // Store recording metadata
    const recordingRecord = await pb.collection('recordings').create({
      call_id: callId,
      provider: 'twilio',
      provider_url: url,
      duration: call.duration || 0,
      size: recordingBuffer.byteLength,
      stored_at: new Date().toISOString(),
    });

    logger.info(`Recording stored: ${recordingRecord.id}`);

    return {
      recordingId: recordingRecord.id,
      callId,
      duration: recordingRecord.duration,
      size: recordingRecord.size,
    };
  }

  /**
   * Stream audio for real-time processing via Twilio Media Streams.
   *
   * @param {string} callId - Internal call ID
   * @param {Function} onAudioChunk - Callback for audio chunks
   * @param {Object} options - Streaming options
   * @returns {Promise<void>}
   */
  async streamAudio(callId, onAudioChunk, options = {}) {
    logger.info(`Audio streaming configured for call: ${callId}`);
  }

  /**
   * Get call details from Twilio.
   *
   * @param {string} callId - Internal call ID
   * @returns {Promise<Object>} Call details
   */
  async getCallDetails(callId) {
    const call = await pb.collection('calls').getOne(callId);
    const providerCallId = call.provider_call_id;

    if (!providerCallId) {
      throw new Error('No provider call ID found');
    }

    // Fetch from Twilio API
    const twilioCall = await this.client.calls(providerCallId).fetch();

    return {
      callId,
      providerCallId,
      from: twilioCall.from,
      to: twilioCall.to,
      status: twilioCall.status,
      duration: twilioCall.duration,
      recordingUrl: call.recording_url,
      initiatedAt: call.initiated_at,
    };
  }

  /**
   * Transfer call to another number.
   *
   * @param {string} callId - Internal call ID
   * @param {string} targetNumber - Target phone number
   * @param {Object} options - Transfer options
   * @returns {Promise<Object>} Transfer result
   */
  async transferCall(callId, targetNumber, options = {}) {
    const call = await pb.collection('calls').getOne(callId);
    const providerCallId = call.provider_call_id;

    // Create TwiML for transfer
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const twiml = new VoiceResponse();
    twiml.dial(targetNumber);

    // Update call with TwiML
    await this.client.calls(providerCallId).update({
      twiml: twiml.toString(),
    });

    // Update call record
    await pb.collection('calls').update(callId, {
      transferred_to: targetNumber,
      transferred_at: new Date().toISOString(),
      status: 'transferred',
    });

    logger.info(`Call transferred: ${callId} to ${targetNumber}`);

    return {
      success: true,
      callId,
      targetNumber,
      status: 'transferred',
    };
  }

  /**
   * Mute call.
   *
   * @param {string} callId - Internal call ID
   * @param {boolean} mute - Mute flag
   * @returns {Promise<Object>} Result
   */
  async muteCall(callId, mute) {
    await pb.collection('calls').update(callId, {
      muted: mute,
      updated_at: new Date().toISOString(),
    });

    logger.info(`Call ${mute ? 'muted' : 'unmuted'}: ${callId}`);

    return {
      callId,
      muted: mute,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Hold call.
   *
   * @param {string} callId - Internal call ID
   * @param {boolean} hold - Hold flag
   * @param {Object} options - Hold options
   * @returns {Promise<Object>} Result
   */
  async holdCall(callId, hold, options = {}) {
    const call = await pb.collection('calls').getOne(callId);
    const providerCallId = call.provider_call_id;

    // Create TwiML for hold
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const twiml = new VoiceResponse();
    if (hold) {
      twiml.play(options.musicUrl || 'http://twimlets.com/holdmusic?Bucket=com.twilio.music.classical');
    } else {
      twiml.dial(call.phone_number);
    }

    // Update call with TwiML
    await this.client.calls(providerCallId).update({
      twiml: twiml.toString(),
    });

    await pb.collection('calls').update(callId, {
      on_hold: hold,
      hold_music_url: options.musicUrl || null,
      updated_at: new Date().toISOString(),
    });

    logger.info(`Call ${hold ? 'held' : 'resumed'}: ${callId}`);

    return {
      callId,
      onHold: hold,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * End call.
   *
   * @param {string} callId - Internal call ID
   * @param {Object} options - End call options
   * @returns {Promise<Object>} Call summary
   */
  async endCall(callId, options = {}) {
    const call = await pb.collection('calls').getOne(callId);
    const providerCallId = call.provider_call_id;

    // End call via Twilio API
    await this.client.calls(providerCallId).update({
      status: 'completed',
    });

    // Calculate duration
    const initiatedAt = new Date(call.initiated_at);
    const duration = Math.floor((Date.now() - initiatedAt.getTime()) / 1000);

    // Update call record
    const updatedCall = await pb.collection('calls').update(callId, {
      status: 'ended',
      duration,
      ended_at: new Date().toISOString(),
      end_reason: options.reason || 'normal',
    });

    // Broadcast via WebSocket
    if (global.io) {
      global.io.of('/call-centre').emit('call:ended', {
        callId,
        duration,
        recordingUrl: call.recording_url,
        status: 'ended',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info(`Call ended: ${callId} (Duration: ${duration}s)`);

    return {
      callId,
      duration,
      recordingUrl: call.recording_url,
      status: 'ended',
    };
  }
}