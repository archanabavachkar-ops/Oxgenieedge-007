import { SMSService } from './SMSService.js';
import { WhatsAppService } from './WhatsAppService.js';
import { EmailService } from './EmailService.js';
import { ChatService } from './ChatService.js';
import logger from '../../utils/logger.js';

/**
 * Message Provider Factory
 * Creates and initializes messaging service instances based on channel
 */
export class MessageFactory {
  /**
   * Create a messaging provider instance
   * @param {string} channel - Channel name (sms, whatsapp, email, chat)
   * @param {Object} config - Provider configuration
   * @returns {Promise<Object>} Initialized provider instance
   * @throws {Error} If provider is unknown or initialization fails
   */
  static async createProvider(channel, config) {
    if (!channel || typeof channel !== 'string') {
      throw new Error('Channel name is required');
    }

    const normalizedChannel = channel.toLowerCase().trim();

    let service = null;

    switch (normalizedChannel) {
      case 'sms':
        service = new SMSService();
        await service.initialize(config);
        logger.info('SMS provider created and initialized');
        return service;

      case 'whatsapp':
        service = new WhatsAppService();
        await service.initialize(config);
        logger.info('WhatsApp provider created and initialized');
        return service;

      case 'email':
        service = new EmailService();
        await service.initialize(config);
        logger.info('Email provider created and initialized');
        return service;

      case 'chat':
        service = new ChatService();
        await service.initialize(config);
        logger.info('Chat provider created and initialized');
        return service;

      default:
        throw new Error(`Unknown messaging channel: ${normalizedChannel}. Supported channels: sms, whatsapp, email, chat`);
    }
  }
}

export default MessageFactory;