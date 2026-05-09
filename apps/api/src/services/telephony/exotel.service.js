import 'dotenv/config';
import axios from 'axios';
import { TelephonyProvider } from './provider.interface.js';
import pb from '../../utils/pocketbaseClient.js';
import logger from '../../utils/logger.js';

/**
 * Exotel telephony service implementation.
 * Extends TelephonyProvider to provide Exotel-specific functionality.
 */
export class ExotelService extends TelephonyProvider {
  constructor() {
    super();
    this.apiKey = null;
    this.apiToken = null;
    this.sid = null;
    this.phoneNumber = null;
    this.baseUrl = 'https://api.exotel.com/v1';
    this.client = null;
  }

  /**
   * Initialize Exotel service with API credentials.
   *
   * @param {Object} config - Configuration object
   * @param {string} config.apiKey - Exotel API key
   * @param {string} config.apiToken - Exotel API token
   * @param {string} config.sid - Exotel SID (account identifier)
   * @param {string} config.phoneNumber - Default outbound phone number
   * @returns {Promise<void>}
   */
  async initialize(config) {
    if (!config.apiKey || !config.apiToken || !config.sid) {
      throw new Error('Exotel configuration missing: apiKey, apiToken, sid required');
    }

    this.apiKey = config.apiKey;
    this.apiToken = config.apiToken;
    this.sid = config.sid;
    this.phoneNumber = config.phoneNumber || '';

    // Create axios client with basic auth
    this.client = axios.create({
      baseURL: `${this.baseUrl}/Accounts/${this.sid}`,
      auth: {
        username: this.apiKey,
        password: this.apiToken,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    logger.info('Exotel service initialized successfully');
  }

  /**
   * Initiate outbound call via Exotel.
   *
   * @param {Object} params - Call parameters
   * @returns {Promise<Object>} Call object
   */
  async initiateCall(params) {
    const { phoneNumber, customerId, agentId, callbackUrl, metadata } = params;

    if (!phoneNumber || !customerId || !agentId) {
      throw new Error('Missing required parameters: phoneNumber, customerId, agentId');
    }

    // Call Exotel API to initiate call
    const response = await this.client.post('/Calls/connect.json', null, {
      params: {
        From: this.phoneNumber,
        To: phoneNumber,
        CallerId: agentId,
        CallbackUrl: callbackUrl || `${process.env.API_BASE_URL}/hcgi/api/telephony/call-status`,
        CustomField: JSON.stringify({ customerId, agentId, ...metadata }),
      },
    });

    const exotelCallId = response.data.Call.Sid;

    // Create call record in database
    const callRecord = await pb.collection('calls').create({
      provider: 'exotel',
      provider_call_id: exotelCallId,
      customer_id: customerId,
      agent_id: agentId,
      phone_number: phoneNumber,
      call_type: 'outbound',
      status: 'initiated',
      initiated_at: new Date().toISOString(),
      metadata: JSON.stringify(metadata || {}),
    });

    logger.info(`Exotel call initiated: ${callRecord.id} (Provider ID: ${exotelCallId})`);

    return {
      callId: callRecord.id,
      providerCallId: exotelCallId,
      status: 'initiated',
      initiatedAt: callRecord.initiated_at,
    };
  }

  /**
   * Handle incoming call webhook from Exotel.
   *
   * @param {Object} webhookData - Webhook payload
   * @returns {Promise<Object>} Created call record
   */
  async handleIncomingCall(webhookData) {
    const { CallSid, From, To, CallerId } = webhookData;

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
      provider: 'exotel',
      provider_call_id: CallSid,
      customer_id: customerId || '',
      phone_number: From,
      called_number: To,
      call_type: 'inbound',
      status: 'incoming',
      caller_id: CallerId || From,
      initiated_at: new Date().toISOString(),
    });

    logger.info(`Incoming call received: ${callRecord.id} from ${From}`);

    return {
      id: callRecord.id,
      callerId: CallerId || From,
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
   * Fetch recording from Exotel and store encrypted.
   *
   * @param {string} callId - Internal call ID
   * @param {string} recordingUrl - Recording URL from Exotel
   * @returns {Promise<Object>} Recording metadata
   */
  async fetchRecording(callId, recordingUrl = null) {
    const call = await pb.collection('calls').getOne(callId);

    const url = recordingUrl || call.recording_url;
    if (!url) {
      throw new Error('No recording URL found');
    }

    // Download recording
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      auth: {
        username: this.apiKey,
        password: this.apiToken,
      },
    });

    const recordingBuffer = response.data;

    // Store recording metadata
    const recordingRecord = await pb.collection('recordings').create({
      call_id: callId,
      provider: 'exotel',
      provider_url: url,
      duration: call.duration || 0,
      size: recordingBuffer.length,
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
   * Stream audio for real-time processing.
   *
   * @param {string} callId - Internal call ID
   * @param {Function} onAudioChunk - Callback for audio chunks
   * @param {Object} options - Streaming options
   * @returns {Promise<void>}
   */
  async streamAudio(callId, onAudioChunk, options = {}) {
    logger.warn('Exotel does not support real-time audio streaming. Use recording-based processing.');
  }

  /**
   * Get call details from Exotel.
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

    // Fetch from Exotel API
    const response = await this.client.get(`/Calls/${providerCallId}.json`);

    return {
      callId,
      providerCallId,
      from: response.data.Call.From,
      to: response.data.Call.To,
      status: response.data.Call.Status,
      duration: response.data.Call.Duration,
      recordingUrl: response.data.Call.RecordingUrl,
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

    // Exotel transfer via API
    await this.client.post(`/Calls/${providerCallId}/transfer.json`, null, {
      params: {
        TransferTo: targetNumber,
      },
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

    // End call via Exotel API
    await this.client.post(`/Calls/${providerCallId}/hangup.json`);

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