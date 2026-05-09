import 'dotenv/config';
import pb from '../../utils/pocketbaseClient.js';
import logger from '../../utils/logger.js';

/**
 * Compliance Service
 * Manages recording consent, compliance validation, and audit trails
 */
export class ComplianceService {
  constructor() {
    this.complianceEnabled = process.env.COMPLIANCE_ENABLED === 'true';
    this.consentExpiryDays = parseInt(process.env.CONSENT_EXPIRY_DAYS || '365');
  }

  /**
   * Check if customer has valid recording consent
   *
   * @param {string} customerId - Customer ID
   * @returns {Promise<Object>} Consent status with {hasConsent, consentMethod, expiryDate, isExpired}
   */
  async checkRecordingConsent(customerId) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      // Fetch active consent records
      const consents = await pb.collection('call_consent').getFullList({
        filter: `customer_id = "${customerId}" && is_active = true`,
        sort: '-created_at',
      }).catch(() => []);

      if (consents.length === 0) {
        logger.info(`No active consent found for customer ${customerId}`);
        return {
          customerId,
          hasConsent: false,
          consentMethod: null,
          expiryDate: null,
          isExpired: false,
          message: 'No active recording consent',
        };
      }

      const consent = consents[0];
      const expiryDate = new Date(consent.expiry_date);
      const now = new Date();
      const isExpired = expiryDate < now;

      logger.info(`Consent checked for customer ${customerId}: ${isExpired ? 'expired' : 'valid'}`);

      return {
        customerId,
        hasConsent: !isExpired,
        consentMethod: consent.method,
        expiryDate: consent.expiry_date,
        isExpired,
        recordedAt: consent.created_at,
        daysRemaining: Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)),
      };
    } catch (error) {
      logger.error(`Failed to check recording consent: ${error.message}`);
      throw error;
    }
  }

  /**
   * Record new consent from customer
   *
   * @param {string} customerId - Customer ID
   * @param {string} method - Consent method (voice, email, sms, web, in-person)
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Recorded consent
   */
  async recordConsent(customerId, method, metadata = {}) {
    try {
      if (!customerId || !method) {
        throw new Error('Customer ID and consent method are required');
      }

      const validMethods = ['voice', 'email', 'sms', 'web', 'in-person'];
      if (!validMethods.includes(method)) {
        throw new Error(`Invalid consent method. Must be one of: ${validMethods.join(', ')}`);
      }

      // Deactivate existing active consents
      const existingConsents = await pb.collection('call_consent').getFullList({
        filter: `customer_id = "${customerId}" && is_active = true`,
      }).catch(() => []);

      for (const consent of existingConsents) {
        await pb.collection('call_consent').update(consent.id, {
          is_active: false,
          deactivated_at: new Date().toISOString(),
        });
      }

      // Create new consent record
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + this.consentExpiryDays);

      const consentRecord = await pb.collection('call_consent').create({
        customer_id: customerId,
        method,
        is_active: true,
        expiry_date: expiryDate.toISOString(),
        metadata: JSON.stringify(metadata),
        created_at: new Date().toISOString(),
      });

      // Log compliance event
      await this.logComplianceEvent(customerId, 'consent_recorded', {
        consentId: consentRecord.id,
        method,
        expiryDate: expiryDate.toISOString(),
      });

      logger.info(`Recording consent recorded for customer ${customerId}: ${method}`);

      return {
        consentId: consentRecord.id,
        customerId,
        method,
        expiryDate: expiryDate.toISOString(),
        recordedAt: consentRecord.created_at,
        daysValid: this.consentExpiryDays,
      };
    } catch (error) {
      logger.error(`Failed to record consent: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update existing consent
   *
   * @param {string} customerId - Customer ID
   * @param {Object} updates - Fields to update {method, expiryDate, metadata}
   * @returns {Promise<Object>} Updated consent
   */
  async updateConsent(customerId, updates) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      // Get active consent
      const consents = await pb.collection('call_consent').getFullList({
        filter: `customer_id = "${customerId}" && is_active = true`,
      });

      if (consents.length === 0) {
        throw new Error('No active consent found to update');
      }

      const consent = consents[0];
      const updateData = {};

      if (updates.method) {
        const validMethods = ['voice', 'email', 'sms', 'web', 'in-person'];
        if (!validMethods.includes(updates.method)) {
          throw new Error(`Invalid consent method. Must be one of: ${validMethods.join(', ')}`);
        }
        updateData.method = updates.method;
      }

      if (updates.expiryDate) {
        const newExpiryDate = new Date(updates.expiryDate);
        if (newExpiryDate < new Date()) {
          throw new Error('Expiry date cannot be in the past');
        }
        updateData.expiry_date = newExpiryDate.toISOString();
      }

      if (updates.metadata) {
        updateData.metadata = JSON.stringify(updates.metadata);
      }

      updateData.updated_at = new Date().toISOString();

      const updatedConsent = await pb.collection('call_consent').update(consent.id, updateData);

      // Log compliance event
      await this.logComplianceEvent(customerId, 'consent_updated', {
        consentId: updatedConsent.id,
        updates,
      });

      logger.info(`Consent updated for customer ${customerId}`);

      return {
        consentId: updatedConsent.id,
        customerId,
        method: updatedConsent.method,
        expiryDate: updatedConsent.expiry_date,
        updatedAt: updateData.updated_at,
      };
    } catch (error) {
      logger.error(`Failed to update consent: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get full consent status for customer
   *
   * @param {string} customerId - Customer ID
   * @returns {Promise<Object>} Full consent status with history
   */
  async getConsentStatus(customerId) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      // Get all consent records
      const consents = await pb.collection('call_consent').getFullList({
        filter: `customer_id = "${customerId}"`,
        sort: '-created_at',
      });

      const activeConsent = consents.find((c) => c.is_active);
      const consentHistory = consents.map((c) => ({
        consentId: c.id,
        method: c.method,
        recordedAt: c.created_at,
        expiryDate: c.expiry_date,
        isActive: c.is_active,
        deactivatedAt: c.deactivated_at || null,
      }));

      logger.info(`Consent status retrieved for customer ${customerId}`);

      return {
        customerId,
        hasActiveConsent: !!activeConsent,
        activeConsent: activeConsent
          ? {
              consentId: activeConsent.id,
              method: activeConsent.method,
              expiryDate: activeConsent.expiry_date,
              recordedAt: activeConsent.created_at,
              isExpired: new Date(activeConsent.expiry_date) < new Date(),
            }
          : null,
        consentHistory,
        totalConsents: consents.length,
      };
    } catch (error) {
      logger.error(`Failed to get consent status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Log compliance event for audit trail
   *
   * @param {string} customerId - Customer ID
   * @param {string} eventType - Type of event
   * @param {Object} details - Event details
   * @returns {Promise<Object>} Logged event
   */
  async logComplianceEvent(customerId, eventType, details = {}) {
    try {
      if (!customerId || !eventType) {
        throw new Error('Customer ID and event type are required');
      }

      const logRecord = await pb.collection('compliance_logs').create({
        customer_id: customerId,
        event_type: eventType,
        details: JSON.stringify(details),
        logged_at: new Date().toISOString(),
      });

      logger.info(`Compliance event logged: ${eventType} for customer ${customerId}`);

      return {
        logId: logRecord.id,
        customerId,
        eventType,
        loggedAt: logRecord.logged_at,
      };
    } catch (error) {
      logger.error(`Failed to log compliance event: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get audit trail for customer
   *
   * @param {string} customerId - Customer ID
   * @param {Object} options - Query options {limit, offset, startDate, endDate}
   * @returns {Promise<Array>} Audit trail events
   */
  async getAuditTrail(customerId, options = {}) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const limit = Math.min(options.limit || 50, 100);
      const offset = options.offset || 0;

      let filter = `customer_id = "${customerId}"`;

      if (options.startDate && options.endDate) {
        const startDate = new Date(options.startDate).toISOString();
        const endDate = new Date(options.endDate).toISOString();
        filter += ` && logged_at >= "${startDate}" && logged_at <= "${endDate}"`;
      }

      const logs = await pb.collection('compliance_logs').getFullList({
        filter,
        sort: '-logged_at',
        limit,
        skip: offset,
      });

      logger.info(`Audit trail retrieved for customer ${customerId}: ${logs.length} events`);

      return logs.map((log) => ({
        logId: log.id,
        customerId: log.customer_id,
        eventType: log.event_type,
        details: log.details ? JSON.parse(log.details) : {},
        loggedAt: log.logged_at,
      }));
    } catch (error) {
      logger.error(`Failed to get audit trail: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if recording is allowed for customer
   *
   * @param {string} customerId - Customer ID
   * @returns {Promise<Object>} Recording permission status
   */
  async isRecordingAllowed(customerId) {
    try {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      if (!this.complianceEnabled) {
        logger.warn('Compliance checking is disabled');
        return {
          customerId,
          isAllowed: true,
          reason: 'Compliance checking disabled',
          complianceEnabled: false,
        };
      }

      const consentStatus = await this.checkRecordingConsent(customerId);

      const isAllowed = consentStatus.hasConsent && !consentStatus.isExpired;

      logger.info(`Recording permission checked for customer ${customerId}: ${isAllowed ? 'allowed' : 'denied'}`);

      return {
        customerId,
        isAllowed,
        reason: isAllowed ? 'Valid consent' : consentStatus.isExpired ? 'Consent expired' : 'No consent',
        consentStatus,
      };
    } catch (error) {
      logger.error(`Failed to check recording permission: ${error.message}`);
      throw error;
    }
  }

  /**
   * Notify customer that recording is starting
   *
   * @param {string} customerId - Customer ID
   * @param {string} callId - Call ID
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Notification result
   */
  async notifyRecordingStart(customerId, callId, metadata = {}) {
    try {
      if (!customerId || !callId) {
        throw new Error('Customer ID and Call ID are required');
      }

      // Log compliance event
      await this.logComplianceEvent(customerId, 'recording_started', {
        callId,
        ...metadata,
      });

      logger.info(`Recording start notification logged for customer ${customerId}, call ${callId}`);

      return {
        customerId,
        callId,
        notified: true,
        timestamp: new Date().toISOString(),
        message: 'Recording start notification logged',
      };
    } catch (error) {
      logger.error(`Failed to notify recording start: ${error.message}`);
      throw error;
    }
  }
}

export default new ComplianceService();