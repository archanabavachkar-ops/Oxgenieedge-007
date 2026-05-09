import 'dotenv/config';
import pb from '../../utils/pocketbaseClient.js';
import logger from '../../utils/logger.js';
import { TelephonyFactory } from '../telephony/factory.js';
import telephonyConfig from '../../config/telephonyConfig.js';
import ComplianceService from '../compliance/ComplianceService.js';

/**
 * Click-to-Call Service
 * Manages click-to-call functionality with agent availability and compliance checks
 */
export class ClickToCallService {
  constructor() {
    this.telephonyProvider = null;
    this.complianceService = ComplianceService;
    this.initializeProvider();
  }

  /**
   * Initialize telephony provider
   */
  async initializeProvider() {
    try {
      const activeProvider = telephonyConfig.activeProvider;
      const providerConfig = telephonyConfig.providers[activeProvider];

      if (!providerConfig || !providerConfig.enabled) {
        logger.warn(`Telephony provider ${activeProvider} is not enabled`);
        return;
      }

      this.telephonyProvider = await TelephonyFactory.createProvider(activeProvider, providerConfig);
      logger.info(`Click-to-Call service initialized with provider: ${activeProvider}`);
    } catch (error) {
      logger.error(`Failed to initialize telephony provider: ${error.message}`);
    }
  }

  /**
   * Validate phone number format (E.164)
   *
   * @param {string} phoneNumber - Phone number to validate
   * @returns {boolean} True if valid
   */
  isValidPhoneNumber(phoneNumber) {
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return false;
    }

    // E.164 format: +[country code][number]
    const e164Regex = /^\+?[1-9]\d{1,14}$/;
    const cleanNumber = phoneNumber.replace(/\D/g, '');

    return e164Regex.test(cleanNumber);
  }

  /**
   * Initiate click-to-call
   *
   * @param {string} phoneNumber - Customer phone number
   * @param {string} customerId - Customer ID
   * @param {string} agentId - Agent ID
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Call initiation result
   */
  async initiateClickToCall(phoneNumber, customerId, agentId, metadata = {}) {
    try {
      // Validate inputs
      if (!phoneNumber || !customerId || !agentId) {
        throw new Error('Phone number, customer ID, and agent ID are required');
      }

      // Validate phone number format
      if (!this.isValidPhoneNumber(phoneNumber)) {
        throw new Error('Invalid phone number format. Use E.164 format (e.g., +1234567890)');
      }

      // Check compliance - verify recording consent
      const recordingAllowed = await this.complianceService.isRecordingAllowed(customerId);
      if (!recordingAllowed.isAllowed) {
        throw new Error(`Recording not allowed: ${recordingAllowed.reason}`);
      }

      // Check agent availability
      const agent = await pb.collection('agents').getOne(agentId).catch(() => null);
      if (!agent) {
        throw new Error('Agent not found');
      }

      if (agent.status !== 'available') {
        throw new Error(`Agent is not available (status: ${agent.status})`);
      }

      const currentCalls = agent.current_calls || 0;
      const maxCalls = agent.max_concurrent_calls || 5;
      if (currentCalls >= maxCalls) {
        throw new Error(`Agent has reached maximum concurrent calls (${maxCalls})`);
      }

      // Initialize telephony provider if not already done
      if (!this.telephonyProvider) {
        await this.initializeProvider();
      }

      if (!this.telephonyProvider) {
        throw new Error('Telephony provider not available');
      }

      // Initiate call via provider
      const callResult = await this.telephonyProvider.initiateCall({
        phoneNumber,
        customerId,
        agentId,
        metadata: {
          ...metadata,
          type: 'click_to_call',
          initiatedAt: new Date().toISOString(),
        },
      });

      // Log communication event
      await this.logCommunicationEvent(customerId, 'click_to_call_initiated', {
        callId: callResult.callId,
        agentId,
        phoneNumber,
      });

      // Notify compliance
      await this.complianceService.notifyRecordingStart(customerId, callResult.callId, {
        type: 'click_to_call',
        agentId,
      });

      logger.info(`Click-to-call initiated: ${callResult.callId} for customer ${customerId}`);

      return {
        success: true,
        callId: callResult.callId,
        customerId,
        agentId,
        phoneNumber,
        status: 'initiated',
        initiatedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(`Failed to initiate click-to-call: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get call status
   *
   * @param {string} callId - Call ID
   * @returns {Promise<Object>} Call status
   */
  async getCallStatus(callId) {
    try {
      if (!callId) {
        throw new Error('Call ID is required');
      }

      const call = await pb.collection('calls').getOne(callId);

      if (!call) {
        throw new Error('Call not found');
      }

      logger.info(`Call status retrieved: ${callId}`);

      return {
        callId,
        customerId: call.customer_id,
        agentId: call.agent_id,
        phoneNumber: call.phone_number,
        status: call.status,
        duration: call.duration || 0,
        initiatedAt: call.initiated_at,
        connectedAt: call.connected_at || null,
        endedAt: call.ended_at || null,
        recordingUrl: call.recording_url || null,
      };
    } catch (error) {
      logger.error(`Failed to get call status: ${error.message}`);
      throw error;
    }
  }

  /**
   * End click-to-call
   *
   * @param {string} callId - Call ID
   * @param {Object} options - End call options {reason, metadata}
   * @returns {Promise<Object>} Call summary
   */
  async endClickToCall(callId, options = {}) {
    try {
      if (!callId) {
        throw new Error('Call ID is required');
      }

      const call = await pb.collection('calls').getOne(callId);

      if (!call) {
        throw new Error('Call not found');
      }

      // End call via provider
      if (this.telephonyProvider) {
        await this.telephonyProvider.endCall(callId, options);
      }

      // Log communication event
      await this.logCommunicationEvent(call.customer_id, 'click_to_call_ended', {
        callId,
        agentId: call.agent_id,
        duration: call.duration || 0,
        reason: options.reason || 'normal',
      });

      logger.info(`Click-to-call ended: ${callId}`);

      return {
        success: true,
        callId,
        customerId: call.customer_id,
        agentId: call.agent_id,
        duration: call.duration || 0,
        status: 'ended',
        endedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(`Failed to end click-to-call: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get call history for customer
   *
   * @param {string} customerId - Customer ID
   * @param {Object} options - Query options {limit, offset, startDate, endDate}
   * @returns {Promise<Array>} Call history
   */
  async getCallHistory(customerId, options = {}) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const limit = Math.min(options.limit || 20, 100);
      const offset = options.offset || 0;

      let filter = `customer_id = "${customerId}" && call_type = "outbound"`;

      if (options.startDate && options.endDate) {
        const startDate = new Date(options.startDate).toISOString();
        const endDate = new Date(options.endDate).toISOString();
        filter += ` && initiated_at >= "${startDate}" && initiated_at <= "${endDate}"`;
      }

      const calls = await pb.collection('calls').getFullList({
        filter,
        sort: '-initiated_at',
        limit,
        skip: offset,
      });

      logger.info(`Call history retrieved for customer ${customerId}: ${calls.length} calls`);

      return calls.map((call) => ({
        callId: call.id,
        customerId: call.customer_id,
        agentId: call.agent_id,
        phoneNumber: call.phone_number,
        status: call.status,
        duration: call.duration || 0,
        initiatedAt: call.initiated_at,
        endedAt: call.ended_at || null,
        recordingUrl: call.recording_url || null,
      }));
    } catch (error) {
      logger.error(`Failed to get call history: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get detailed call information
   *
   * @param {string} callId - Call ID
   * @returns {Promise<Object>} Call details
   */
  async getCallDetails(callId) {
    try {
      if (!callId) {
        throw new Error('Call ID is required');
      }

      const call = await pb.collection('calls').getOne(callId);

      if (!call) {
        throw new Error('Call not found');
      }

      // Get associated transcription if available
      let transcription = null;
      try {
        const transcriptions = await pb.collection('call_transcriptions').getFullList({
          filter: `call_id = "${callId}"`,
        });
        if (transcriptions.length > 0) {
          transcription = transcriptions[0];
        }
      } catch (error) {
        logger.warn(`Could not fetch transcription for call ${callId}`);
      }

      // Get associated summary if available
      let summary = null;
      try {
        const summaries = await pb.collection('call_summaries').getFullList({
          filter: `call_id = "${callId}"`,
        });
        if (summaries.length > 0) {
          summary = summaries[0];
        }
      } catch (error) {
        logger.warn(`Could not fetch summary for call ${callId}`);
      }

      logger.info(`Call details retrieved: ${callId}`);

      return {
        callId,
        customerId: call.customer_id,
        agentId: call.agent_id,
        phoneNumber: call.phone_number,
        status: call.status,
        duration: call.duration || 0,
        initiatedAt: call.initiated_at,
        connectedAt: call.connected_at || null,
        endedAt: call.ended_at || null,
        recordingUrl: call.recording_url || null,
        sentiment: call.sentiment || null,
        notes: call.notes || '',
        transcription: transcription
          ? {
              text: transcription.text,
              language: transcription.language,
              confidence: transcription.confidence,
            }
          : null,
        summary: summary
          ? {
              text: summary.summary,
              keyPoints: summary.key_points ? JSON.parse(summary.key_points) : [],
              sentiment: summary.sentiment,
            }
          : null,
      };
    } catch (error) {
      logger.error(`Failed to get call details: ${error.message}`);
      throw error;
    }
  }

  /**
   * Log communication event
   *
   * @param {string} customerId - Customer ID
   * @param {string} eventType - Type of event
   * @param {Object} details - Event details
   * @returns {Promise<Object>} Logged event
   */
  async logCommunicationEvent(customerId, eventType, details = {}) {
    try {
      if (!customerId || !eventType) {
        throw new Error('Customer ID and event type are required');
      }

      const logRecord = await pb.collection('communication_logs').create({
        customer_id: customerId,
        event_type: eventType,
        details: JSON.stringify(details),
        logged_at: new Date().toISOString(),
      }).catch(() => {
        // Fallback if collection doesn't exist
        logger.warn(`Could not log communication event - collection may not exist`);
        return { id: 'fallback_' + Date.now() };
      });

      logger.info(`Communication event logged: ${eventType} for customer ${customerId}`);

      return {
        logId: logRecord.id,
        customerId,
        eventType,
        loggedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(`Failed to log communication event: ${error.message}`);
      // Don't throw - logging failures shouldn't break the call
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default new ClickToCallService();