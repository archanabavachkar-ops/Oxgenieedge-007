import { ExotelService } from './exotel.service.js';
import { TwilioService } from './twilio.service.js';
import logger from '../../utils/logger.js';

/**
 * Telephony Provider Factory
 * Creates and initializes telephony service instances based on provider name
 */
export class TelephonyFactory {
  /**
   * Create a telephony provider instance.
   *
   * @param {string} providerName - Name of the provider (exotel, twilio)
   * @param {Object} config - Provider configuration
   * @returns {Promise<Object>} Initialized provider instance
   * @throws {Error} If provider is unknown or initialization fails
   */
  static async createProvider(providerName, config) {
    if (!providerName || typeof providerName !== 'string') {
      throw new Error('Provider name is required');
    }

    const provider = providerName.toLowerCase().trim();

    let service = null;

    switch (provider) {
      case 'exotel':
        service = new ExotelService();
        await service.initialize(config);
        logger.info('Exotel provider created and initialized');
        return service;

      case 'twilio':
        service = new TwilioService();
        await service.initialize(config);
        logger.info('Twilio provider created and initialized');
        return service;

      default:
        throw new Error(`Unknown telephony provider: ${providerName}. Supported providers: exotel, twilio`);
    }
  }
}

export default TelephonyFactory;