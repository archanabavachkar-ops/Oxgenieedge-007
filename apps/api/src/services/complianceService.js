import 'dotenv/config';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

/**
 * Compliance Service
 * Manages recording consent and compliance requirements
 */
export class ComplianceService {
  /**
   * Check if customer has given recording consent.
   *
   * @param {string} customerId - Customer ID
   * @returns {Promise<Object>} Consent status with {hasConsent, consentMethod, expiryDate}
   */
  async checkRecordingConsent(customerId) {
    try {
      const consents = await pb.collection('recording_consents').getFullList({
        filter: `customer_id = "${customerId}" && is_active = true`,
      });

      if (consents.length === 0) {
        return {
          customerId,
          hasConsent: false,
          consentMethod: null,
          expiryDate: null,
        };
      }

      const consent = consents[0];
      const expiryDate = new Date(consent.expiry_date);
      const isExpired = expiryDate < new Date();

      return {
        customerId,
        hasConsent: !isExpired,
        consentMethod: consent.method,
        expiryDate: consent.expiry_date,
        isExpired,
      };
    } catch (error) {
      logger.error(`Failed to check recording consent: ${error.message}`);
      throw error;
    }
  }

  /**
   * Record consent from customer.
   *
   * @param {string} customerId - Customer ID
   * @param {string} method - Consent method (voice, email, sms, web)
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Recorded consent
   */
  async recordConsent(customerId, method, metadata = {}) {
    try {
      if (!['voice', 'email', 'sms', 'web'].includes(method)) {
        throw new Error('Invalid consent method');
      }

      // Check for existing active consent
      const existingConsents = await pb.collection('recording_consents').getFullList({
        filter: `customer_id = "${customerId}" && is_active = true`,
      });

      // Deactivate existing consents
      for (const consent of existingConsents) {
        await pb.collection('recording_consents').update(consent.id, {
          is_active: false,
          deactivated_at: new Date().toISOString(),
        });
      }

      // Create new consent record
      const consentRecord = await pb.collection('recording_consents').create({
        customer_id: customerId,
        method,
        is_active: true,
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        metadata: JSON.stringify(metadata),
        recorded_at: new Date().toISOString(),
      });

      logger.info(`Recording consent recorded: ${consentRecord.id} for customer ${customerId}`);

      return {
        consentId: consentRecord.id,
        customerId,
        method,
        expiryDate: consentRecord.expiry_date,
        recordedAt: consentRecord.recorded_at,
      };
    } catch (error) {
      logger.error(`Failed to record consent: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get full consent status for customer.
   *
   * @param {string} customerId - Customer ID
   * @returns {Promise<Object>} Full consent status
   */
  async getConsentStatus(customerId) {
    try {
      const consents = await pb.collection('recording_consents').getFullList({
        filter: `customer_id = "${customerId}"`,
        sort: '-recorded_at',
      });

      const activeConsent = consents.find((c) => c.is_active);
      const consentHistory = consents.map((c) => ({
        consentId: c.id,
        method: c.method,
        recordedAt: c.recorded_at,
        expiryDate: c.expiry_date,
        isActive: c.is_active,
      }));

      return {
        customerId,
        hasActiveConsent: !!activeConsent,
        activeConsent: activeConsent ? {
          consentId: activeConsent.id,
          method: activeConsent.method,
          expiryDate: activeConsent.expiry_date,
          recordedAt: activeConsent.recorded_at,
        } : null,
        consentHistory,
      };
    } catch (error) {
      logger.error(`Failed to get consent status: ${error.message}`);
      throw error;
    }
  }
}

export default new ComplianceService();