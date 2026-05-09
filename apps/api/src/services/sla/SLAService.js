import 'dotenv/config';
import pb from '../../utils/pocketbaseClient.js';
import logger from '../../utils/logger.js';

/**
 * SLA Service
 * Manages Service Level Agreements and SLA evaluation
 */
export class SLAService {
  /**
   * Get all SLA policies for an organization
   * @param {string} organizationId - Organization ID
   * @returns {Promise<Array>} Array of SLA policies
   */
  async getPolicies(organizationId) {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    const policies = await pb.collection('sla_policies').getFullList({
      filter: `organization_id = "${organizationId}"`,
      sort: '-created',
    });

    logger.info(`SLA policies retrieved for organization ${organizationId}: ${policies.length}`);

    return policies.map((p) => ({
      id: p.id,
      name: p.name,
      channel: p.channel,
      first_response_time: p.first_response_time,
      resolution_time: p.resolution_time,
      is_active: p.is_active,
      created_by: p.created_by,
      created: p.created,
    }));
  }

  /**
   * Get a single SLA policy by ID
   * @param {string} policyId - Policy ID
   * @returns {Promise<Object>} Policy object
   */
  async getPolicy(policyId) {
    if (!policyId) {
      throw new Error('Policy ID is required');
    }

    const policy = await pb.collection('sla_policies').getOne(policyId);

    if (!policy) {
      throw new Error('SLA policy not found');
    }

    logger.info(`SLA policy retrieved: ${policyId}`);

    return {
      id: policy.id,
      name: policy.name,
      channel: policy.channel,
      first_response_time: policy.first_response_time,
      resolution_time: policy.resolution_time,
      is_active: policy.is_active,
      created_by: policy.created_by,
      created: policy.created,
    };
  }

  /**
   * Create a new SLA policy
   * @param {string} organizationId - Organization ID
   * @param {Object} data - Policy data {name, channel, first_response_time, resolution_time, is_active, created_by}
   * @returns {Promise<Object>} Created policy
   */
  async createPolicy(organizationId, data) {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      throw new Error('Policy name is required and must be a non-empty string');
    }

    if (!data.channel || typeof data.channel !== 'string' || data.channel.trim() === '') {
      throw new Error('Channel is required and must be a non-empty string');
    }

    if (data.first_response_time === undefined || typeof data.first_response_time !== 'number') {
      throw new Error('First response time is required and must be a number (in minutes)');
    }

    if (data.resolution_time === undefined || typeof data.resolution_time !== 'number') {
      throw new Error('Resolution time is required and must be a number (in minutes)');
    }

    const policy = await pb.collection('sla_policies').create({
      organization_id: organizationId,
      name: data.name.trim(),
      channel: data.channel.trim(),
      first_response_time: data.first_response_time,
      resolution_time: data.resolution_time,
      is_active: data.is_active !== false,
      created_by: data.created_by || 'system',
    });

    logger.info(`SLA policy created: ${policy.id} - ${data.name}`);

    return {
      id: policy.id,
      name: policy.name,
      channel: policy.channel,
      first_response_time: policy.first_response_time,
      resolution_time: policy.resolution_time,
      is_active: policy.is_active,
      created_by: policy.created_by,
      created: policy.created,
    };
  }

  /**
   * Update an existing SLA policy
   * @param {string} policyId - Policy ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated policy
   */
  async updatePolicy(policyId, data) {
    if (!policyId) {
      throw new Error('Policy ID is required');
    }

    const policy = await pb.collection('sla_policies').getOne(policyId);

    if (!policy) {
      throw new Error('SLA policy not found');
    }

    const updateData = {};

    if (data.name !== undefined) {
      if (typeof data.name !== 'string' || data.name.trim() === '') {
        throw new Error('Policy name must be a non-empty string');
      }
      updateData.name = data.name.trim();
    }

    if (data.channel !== undefined) {
      if (typeof data.channel !== 'string' || data.channel.trim() === '') {
        throw new Error('Channel must be a non-empty string');
      }
      updateData.channel = data.channel.trim();
    }

    if (data.first_response_time !== undefined) {
      if (typeof data.first_response_time !== 'number') {
        throw new Error('First response time must be a number');
      }
      updateData.first_response_time = data.first_response_time;
    }

    if (data.resolution_time !== undefined) {
      if (typeof data.resolution_time !== 'number') {
        throw new Error('Resolution time must be a number');
      }
      updateData.resolution_time = data.resolution_time;
    }

    if (data.is_active !== undefined) {
      updateData.is_active = data.is_active;
    }

    updateData.updated = new Date().toISOString();

    const updated = await pb.collection('sla_policies').update(policyId, updateData);

    logger.info(`SLA policy updated: ${policyId}`);

    return {
      id: updated.id,
      name: updated.name,
      channel: updated.channel,
      first_response_time: updated.first_response_time,
      resolution_time: updated.resolution_time,
      is_active: updated.is_active,
      created_by: updated.created_by,
      created: updated.created,
      updated: updated.updated,
    };
  }

  /**
   * Delete an SLA policy
   * @param {string} policyId - Policy ID
   * @returns {Promise<Object>} Deletion result
   */
  async deletePolicy(policyId) {
    if (!policyId) {
      throw new Error('Policy ID is required');
    }

    const policy = await pb.collection('sla_policies').getOne(policyId);

    if (!policy) {
      throw new Error('SLA policy not found');
    }

    await pb.collection('sla_policies').delete(policyId);

    logger.info(`SLA policy deleted: ${policyId}`);

    return { success: true, message: 'SLA policy deleted successfully' };
  }

  /**
   * Calculate metrics for a conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<Object>} Metrics object
   */
  async calculateMetrics(conversationId) {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }

    const conversation = await pb.collection('conversations').getOne(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Fetch all messages for this conversation
    const messages = await pb.collection('messages').getFullList({
      filter: `conversation_id = "${conversationId}"`,
      sort: 'created',
    });

    let firstResponseTime = null;
    let resolutionTime = null;

    if (messages.length > 0) {
      const conversationCreatedAt = new Date(conversation.created);

      // Find first outbound message (response)
      const firstResponse = messages.find((m) => m.direction === 'outbound');
      if (firstResponse) {
        const firstResponseAt = new Date(firstResponse.created);
        firstResponseTime = Math.floor((firstResponseAt - conversationCreatedAt) / 1000); // in seconds
      }

      // Calculate resolution time (last message timestamp - conversation created)
      const lastMessage = messages[messages.length - 1];
      const lastMessageAt = new Date(lastMessage.created);
      resolutionTime = Math.floor((lastMessageAt - conversationCreatedAt) / 1000); // in seconds
    }

    logger.info(`Metrics calculated for conversation ${conversationId}`);

    return {
      first_response_time: firstResponseTime,
      resolution_time: resolutionTime,
      message_count: messages.length,
    };
  }

  /**
   * Evaluate SLA compliance for a conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<Object>} SLA evaluation result
   */
  async evaluateSLA(conversationId) {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }

    const conversation = await pb.collection('conversations').getOne(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Get applicable SLA policy
    const policies = await this.getPolicies(conversation.organization_id);
    const applicablePolicy = policies.find((p) => p.channel === conversation.channel && p.is_active);

    if (!applicablePolicy) {
      logger.warn(`No applicable SLA policy found for conversation ${conversationId}`);
      return {
        sla_met: true,
        first_response_sla_met: true,
        resolution_sla_met: true,
        breach_details: {},
        message: 'No SLA policy applicable',
      };
    }

    // Calculate metrics
    const metrics = await this.calculateMetrics(conversationId);

    // Convert policy times from minutes to seconds
    const firstResponseThreshold = applicablePolicy.first_response_time * 60;
    const resolutionThreshold = applicablePolicy.resolution_time * 60;

    // Evaluate SLA
    const firstResponseSLAMet = metrics.first_response_time === null || metrics.first_response_time <= firstResponseThreshold;
    const resolutionSLAMet = metrics.resolution_time === null || metrics.resolution_time <= resolutionThreshold;
    const slaMet = firstResponseSLAMet && resolutionSLAMet;

    const breachDetails = {};
    if (!firstResponseSLAMet) {
      breachDetails.first_response_breach = {
        threshold_seconds: firstResponseThreshold,
        actual_seconds: metrics.first_response_time,
        exceeded_by_seconds: metrics.first_response_time - firstResponseThreshold,
      };
    }
    if (!resolutionSLAMet) {
      breachDetails.resolution_breach = {
        threshold_seconds: resolutionThreshold,
        actual_seconds: metrics.resolution_time,
        exceeded_by_seconds: metrics.resolution_time - resolutionThreshold,
      };
    }

    logger.info(`SLA evaluated for conversation ${conversationId}: ${slaMet ? 'MET' : 'BREACHED'}`);

    return {
      sla_met: slaMet,
      first_response_sla_met: firstResponseSLAMet,
      resolution_sla_met: resolutionSLAMet,
      policy_id: applicablePolicy.id,
      policy_name: applicablePolicy.name,
      metrics,
      breach_details: breachDetails,
    };
  }

  /**
   * Check if SLA will be breached soon
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<Object>} Breach warning
   */
  async checkSLABreach(conversationId) {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }

    const conversation = await pb.collection('conversations').getOne(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Get applicable SLA policy
    const policies = await this.getPolicies(conversation.organization_id);
    const applicablePolicy = policies.find((p) => p.channel === conversation.channel && p.is_active);

    if (!applicablePolicy) {
      return {
        will_breach: false,
        time_remaining_minutes: null,
      };
    }

    // Calculate elapsed time since conversation created
    const conversationCreatedAt = new Date(conversation.created);
    const now = new Date();
    const elapsedSeconds = Math.floor((now - conversationCreatedAt) / 1000);
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);

    // Check if approaching threshold (with 10-minute buffer)
    const firstResponseThreshold = applicablePolicy.first_response_time - 10;
    const resolutionThreshold = applicablePolicy.resolution_time - 10;

    const willBreachFirstResponse = elapsedMinutes >= firstResponseThreshold && elapsedMinutes < applicablePolicy.first_response_time;
    const willBreachResolution = elapsedMinutes >= resolutionThreshold && elapsedMinutes < applicablePolicy.resolution_time;

    const willBreach = willBreachFirstResponse || willBreachResolution;
    const timeRemaining = willBreach ? Math.min(
      applicablePolicy.first_response_time - elapsedMinutes,
      applicablePolicy.resolution_time - elapsedMinutes
    ) : null;

    logger.info(`SLA breach check for conversation ${conversationId}: ${willBreach ? 'WARNING' : 'OK'}`);

    return {
      will_breach: willBreach,
      time_remaining_minutes: timeRemaining,
      breach_type: willBreachFirstResponse ? 'first_response' : 'resolution',
    };
  }

  /**
   * Get all SLA breaches for an organization
   * @param {string} organizationId - Organization ID
   * @param {Object} filters - Optional filters {dateRange}
   * @returns {Promise<Array>} Array of breached conversations
   */
  async getSLABreaches(organizationId, filters = {}) {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    let filter = `organization_id = "${organizationId}" && sla_met = false`;

    if (filters.dateRange && filters.dateRange.startDate && filters.dateRange.endDate) {
      const startDate = new Date(filters.dateRange.startDate).toISOString();
      const endDate = new Date(filters.dateRange.endDate).toISOString();
      filter += ` && created >= "${startDate}" && created <= "${endDate}"`;
    }

    const breaches = await pb.collection('conversation_metrics').getFullList({
      filter,
      sort: '-created',
    });

    logger.info(`SLA breaches retrieved for organization ${organizationId}: ${breaches.length}`);

    return breaches.map((b) => ({
      id: b.id,
      conversation_id: b.conversation_id,
      channel: b.channel,
      first_response_sla_met: b.first_response_sla_met,
      resolution_sla_met: b.resolution_sla_met,
      first_response_time: b.first_response_time,
      resolution_time: b.resolution_time,
      created: b.created,
    }));
  }

  /**
   * Record SLA metrics for a conversation
   * @param {string} conversationId - Conversation ID
   * @param {Object} metrics - Metrics object
   * @returns {Promise<Object>} Recorded metrics
   */
  async recordSLAMetrics(conversationId, metrics) {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }

    if (!metrics) {
      throw new Error('Metrics object is required');
    }

    // Check if metrics record already exists
    const existingMetrics = await pb.collection('conversation_metrics').getFullList({
      filter: `conversation_id = "${conversationId}"`,
    }).catch(() => []);

    const recordData = {
      conversation_id: conversationId,
      organization_id: metrics.organization_id,
      channel: metrics.channel,
      customer_id: metrics.customer_id,
      agent_id: metrics.agent_id,
      first_response_time: metrics.first_response_time,
      resolution_time: metrics.resolution_time,
      sla_met: metrics.sla_met,
      first_response_sla_met: metrics.first_response_sla_met,
      resolution_sla_met: metrics.resolution_sla_met,
      message_count: metrics.message_count,
      customer_satisfaction: metrics.customer_satisfaction,
      tags: metrics.tags ? JSON.stringify(metrics.tags) : '[]',
    };

    let result;
    if (existingMetrics.length > 0) {
      result = await pb.collection('conversation_metrics').update(existingMetrics[0].id, recordData);
    } else {
      result = await pb.collection('conversation_metrics').create(recordData);
    }

    logger.info(`SLA metrics recorded for conversation ${conversationId}`);

    return {
      id: result.id,
      conversation_id: result.conversation_id,
      sla_met: result.sla_met,
      first_response_sla_met: result.first_response_sla_met,
      resolution_sla_met: result.resolution_sla_met,
    };
  }
}

export default new SLAService();