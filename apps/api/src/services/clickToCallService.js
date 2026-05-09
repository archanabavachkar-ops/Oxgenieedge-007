import 'dotenv/config';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { ExotelService } from './telephony/exotel.service.js';
import { TwilioService } from './telephony/twilio.service.js';
import telephonyConfig from '../config/telephonyConfig.js';

/**
 * Click-to-Call Service
 * Manages click-to-call functionality with agent availability checks
 */
export class ClickToCallService {
  constructor() {
    this.exotelService = null;
    this.twilioService = null;
    this.initializeProviders();
  }

  /**
   * Initialize telephony providers.
   */
  initializeProviders() {
    if (telephonyConfig.providers.exotel.enabled) {
      this.exotelService = new ExotelService();
      this.exotelService.initialize({
        apiKey: telephonyConfig.providers.exotel.apiKey,
        apiToken: telephonyConfig.providers.exotel.apiToken,
        sid: telephonyConfig.providers.exotel.sid,
        phoneNumber: telephonyConfig.providers.exotel.phoneNumber,
      }).catch((error) => {
        logger.warn(`Failed to initialize Exotel: ${error.message}`);
      });
    }

    if (telephonyConfig.providers.twilio.enabled) {
      this.twilioService = new TwilioService();
      this.twilioService.initialize({
        accountSid: telephonyConfig.providers.twilio.accountSid,
        authToken: telephonyConfig.providers.twilio.authToken,
        phoneNumber: telephonyConfig.providers.twilio.phoneNumber,
      }).catch((error) => {
        logger.warn(`Failed to initialize Twilio: ${error.message}`);
      });
    }
  }

  /**
   * Validate phone number format.
   *
   * @param {string} phoneNumber - Phone number to validate
   * @returns {boolean} True if valid
   */
  validatePhoneNumber(phoneNumber) {
    // E.164 format validation
    const e164Regex = /^\+?[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber.replace(/\D/g, ''));
  }

  /**
   * Initiate click-to-call.
   *
   * @param {string} phoneNumber - Customer phone number
   * @param {string} customerId - Customer ID
   * @param {string} agentId - Agent ID
   * @returns {Promise<Object>} Call initiation result
   */
  async initiateClickToCall(phoneNumber, customerId, agentId) {
    try {
      // Validate phone number
      if (!this.validatePhoneNumber(phoneNumber)) {
        throw new Error('Invalid phone number format');
      }

      // Check agent availability
      const agent = await pb.collection('agents').getOne(agentId);

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

      // Select provider
      let provider = null;
      if (this.exotelService) {
        provider = this.exotelService;
      } else if (this.twilioService) {
        provider = this.twilioService;
      } else {
        throw new Error('No telephony provider configured');
      }

      // Initiate call
      const callResult = await provider.initiateCall({
        phoneNumber,
        customerId,
        agentId,
        metadata: {
          type: 'click_to_call',
          initiatedAt: new Date().toISOString(),
        },
      });

      // Notify agent via WebSocket
      if (global.io) {
        global.io.of('/call-centre').to(`agent:${agentId}`).emit('call:incoming', {
          callId: callResult.callId,
          phoneNumber,
          customerId,
          type: 'click_to_call',
          initiatedAt: new Date().toISOString(),
        });
      }

      logger.info(`Click-to-call initiated: ${callResult.callId} for agent ${agentId}`);

      return {
        callId: callResult.callId,
        status: 'initiated',
        phoneNumber,
        agentId,
        initiatedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(`Failed to initiate click-to-call: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get real-time call status.
   *
   * @param {string} callId - Call ID
   * @returns {Promise<Object>} Call status
   */
  async getCallStatus(callId) {
    try {
      const call = await pb.collection('calls').getOne(callId);

      if (!call) {
        throw new Error('Call not found');
      }

      return {
        callId,
        status: call.status,
        agentId: call.agent_id,
        customerId: call.customer_id,
        phoneNumber: call.phone_number,
        duration: call.duration || 0,
        initiatedAt: call.initiated_at,
        connectedAt: call.connected_at || null,
        endedAt: call.ended_at || null,
      };
    } catch (error) {
      logger.error(`Failed to get call status: ${error.message}`);
      throw error;
    }
  }
}

export default new ClickToCallService();