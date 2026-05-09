import 'dotenv/config';
import pb from '../../utils/pocketbaseClient.js';
import logger from '../../utils/logger.js';
import TemplateService from './TemplateService.js';

/**
 * Auto-Reply Service
 * Manages auto-reply rules and their execution
 */
export class AutoReplyService {
  /**
   * Get all auto-reply rules for an organization with optional filters
   * @param {string} organizationId - Organization ID
   * @param {Object} filters - Optional filters {channel, trigger_type, is_active}
   * @returns {Promise<Array>} Array of rules
   */
  async getRules(organizationId, filters = {}) {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    let filter = `organization_id = "${organizationId}"`;

    if (filters.channel) {
      filter += ` && channel = "${filters.channel}"`;
    }

    if (filters.trigger_type) {
      filter += ` && trigger_type = "${filters.trigger_type}"`;
    }

    if (filters.is_active !== undefined) {
      filter += ` && is_active = ${filters.is_active}`;
    }

    const rules = await pb.collection('auto_reply_rules').getFullList({
      filter,
      sort: '-priority',
    });

    logger.info(`Auto-reply rules retrieved for organization ${organizationId}: ${rules.length}`);

    return rules.map((r) => ({
      id: r.id,
      name: r.name,
      channel: r.channel,
      trigger_type: r.trigger_type,
      trigger_value: r.trigger_value,
      template_id: r.template_id,
      conditions: r.conditions ? JSON.parse(r.conditions) : {},
      priority: r.priority,
      is_active: r.is_active,
      created_by: r.created_by,
      created: r.created,
    }));
  }

  /**
   * Get a single auto-reply rule by ID
   * @param {string} ruleId - Rule ID
   * @returns {Promise<Object>} Rule object
   */
  async getRule(ruleId) {
    if (!ruleId) {
      throw new Error('Rule ID is required');
    }

    const rule = await pb.collection('auto_reply_rules').getOne(ruleId);

    if (!rule) {
      throw new Error('Auto-reply rule not found');
    }

    logger.info(`Auto-reply rule retrieved: ${ruleId}`);

    return {
      id: rule.id,
      name: rule.name,
      channel: rule.channel,
      trigger_type: rule.trigger_type,
      trigger_value: rule.trigger_value,
      template_id: rule.template_id,
      conditions: rule.conditions ? JSON.parse(rule.conditions) : {},
      priority: rule.priority,
      is_active: rule.is_active,
      created_by: rule.created_by,
      created: rule.created,
    };
  }

  /**
   * Create a new auto-reply rule
   * @param {string} organizationId - Organization ID
   * @param {Object} data - Rule data {name, channel, trigger_type, trigger_value, template_id, conditions, priority, is_active, created_by}
   * @returns {Promise<Object>} Created rule
   */
  async createRule(organizationId, data) {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      throw new Error('Rule name is required and must be a non-empty string');
    }

    if (!data.channel || typeof data.channel !== 'string' || data.channel.trim() === '') {
      throw new Error('Channel is required and must be a non-empty string');
    }

    if (!data.trigger_type || typeof data.trigger_type !== 'string' || data.trigger_type.trim() === '') {
      throw new Error('Trigger type is required and must be a non-empty string');
    }

    if (!data.template_id || typeof data.template_id !== 'string' || data.template_id.trim() === '') {
      throw new Error('Template ID is required and must be a non-empty string');
    }

    const rule = await pb.collection('auto_reply_rules').create({
      organization_id: organizationId,
      name: data.name.trim(),
      channel: data.channel.trim(),
      trigger_type: data.trigger_type.trim(),
      trigger_value: data.trigger_value ? data.trigger_value.trim() : '',
      template_id: data.template_id.trim(),
      conditions: data.conditions ? JSON.stringify(data.conditions) : '{}',
      priority: data.priority || 0,
      is_active: data.is_active !== false,
      created_by: data.created_by || 'system',
    });

    logger.info(`Auto-reply rule created: ${rule.id} - ${data.name}`);

    return {
      id: rule.id,
      name: rule.name,
      channel: rule.channel,
      trigger_type: rule.trigger_type,
      trigger_value: rule.trigger_value,
      template_id: rule.template_id,
      conditions: rule.conditions ? JSON.parse(rule.conditions) : {},
      priority: rule.priority,
      is_active: rule.is_active,
      created_by: rule.created_by,
      created: rule.created,
    };
  }

  /**
   * Update an existing auto-reply rule
   * @param {string} ruleId - Rule ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated rule
   */
  async updateRule(ruleId, data) {
    if (!ruleId) {
      throw new Error('Rule ID is required');
    }

    const rule = await pb.collection('auto_reply_rules').getOne(ruleId);

    if (!rule) {
      throw new Error('Auto-reply rule not found');
    }

    const updateData = {};

    if (data.name !== undefined) {
      if (typeof data.name !== 'string' || data.name.trim() === '') {
        throw new Error('Rule name must be a non-empty string');
      }
      updateData.name = data.name.trim();
    }

    if (data.channel !== undefined) {
      if (typeof data.channel !== 'string' || data.channel.trim() === '') {
        throw new Error('Channel must be a non-empty string');
      }
      updateData.channel = data.channel.trim();
    }

    if (data.trigger_type !== undefined) {
      if (typeof data.trigger_type !== 'string' || data.trigger_type.trim() === '') {
        throw new Error('Trigger type must be a non-empty string');
      }
      updateData.trigger_type = data.trigger_type.trim();
    }

    if (data.trigger_value !== undefined) {
      updateData.trigger_value = data.trigger_value ? data.trigger_value.trim() : '';
    }

    if (data.template_id !== undefined) {
      if (typeof data.template_id !== 'string' || data.template_id.trim() === '') {
        throw new Error('Template ID must be a non-empty string');
      }
      updateData.template_id = data.template_id.trim();
    }

    if (data.conditions !== undefined) {
      updateData.conditions = data.conditions ? JSON.stringify(data.conditions) : '{}';
    }

    if (data.priority !== undefined) {
      updateData.priority = data.priority;
    }

    if (data.is_active !== undefined) {
      updateData.is_active = data.is_active;
    }

    updateData.updated = new Date().toISOString();

    const updated = await pb.collection('auto_reply_rules').update(ruleId, updateData);

    logger.info(`Auto-reply rule updated: ${ruleId}`);

    return {
      id: updated.id,
      name: updated.name,
      channel: updated.channel,
      trigger_type: updated.trigger_type,
      trigger_value: updated.trigger_value,
      template_id: updated.template_id,
      conditions: updated.conditions ? JSON.parse(updated.conditions) : {},
      priority: updated.priority,
      is_active: updated.is_active,
      created_by: updated.created_by,
      created: updated.created,
      updated: updated.updated,
    };
  }

  /**
   * Delete an auto-reply rule
   * @param {string} ruleId - Rule ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteRule(ruleId) {
    if (!ruleId) {
      throw new Error('Rule ID is required');
    }

    const rule = await pb.collection('auto_reply_rules').getOne(ruleId);

    if (!rule) {
      throw new Error('Auto-reply rule not found');
    }

    await pb.collection('auto_reply_rules').delete(ruleId);

    logger.info(`Auto-reply rule deleted: ${ruleId}`);

    return { success: true, message: 'Auto-reply rule deleted successfully' };
  }

  /**
   * Evaluate which rules match a trigger
   * @param {string} conversationId - Conversation ID
   * @param {Object} trigger - Trigger object {type, value}
   * @returns {Promise<Array>} Array of matching rule IDs
   */
  async evaluateRules(conversationId, trigger = {}) {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }

    if (!trigger.type) {
      throw new Error('Trigger type is required');
    }

    // Fetch conversation to get organization_id and channel
    const conversation = await pb.collection('conversations').getOne(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Fetch all active rules for this organization
    const rules = await this.getRules(conversation.organization_id, { is_active: true });

    const matchingRules = [];

    for (const rule of rules) {
      let matches = false;

      // Check trigger type match
      if (rule.trigger_type !== trigger.type) {
        continue;
      }

      // Check channel match
      if (rule.channel !== conversation.channel) {
        continue;
      }

      // Evaluate conditions based on trigger type
      const conditions = rule.conditions || {};

      switch (trigger.type) {
        case 'message_received':
          // Check keyword match
          if (conditions.keyword && trigger.value) {
            matches = trigger.value.toLowerCase().includes(conditions.keyword.toLowerCase());
          } else {
            matches = true;
          }
          break;

        case 'time_based':
          // Check if current time is within specified range
          if (conditions.start_time && conditions.end_time) {
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes();
            const startTime = parseInt(conditions.start_time);
            const endTime = parseInt(conditions.end_time);
            matches = currentTime >= startTime && currentTime <= endTime;
          } else {
            matches = true;
          }
          break;

        case 'status_based':
          // Check if conversation status matches
          if (conditions.status) {
            matches = conversation.status === conditions.status;
          } else {
            matches = true;
          }
          break;

        case 'agent_unavailable':
          // Check if agent is unavailable
          if (conversation.agent_id) {
            try {
              const agent = await pb.collection('agents').getOne(conversation.agent_id);
              matches = agent.status !== 'available';
            } catch (error) {
              matches = true; // If agent not found, consider unavailable
            }
          } else {
            matches = true; // No agent assigned
          }
          break;

        default:
          matches = true;
      }

      if (matches) {
        matchingRules.push({
          id: rule.id,
          priority: rule.priority,
        });
      }
    }

    // Sort by priority (descending)
    matchingRules.sort((a, b) => b.priority - a.priority);

    logger.info(`Auto-reply rules evaluated for conversation ${conversationId}: ${matchingRules.length} matches`);

    return matchingRules.map((r) => r.id);
  }

  /**
   * Execute an auto-reply rule
   * @param {string} ruleId - Rule ID
   * @param {string} conversationId - Conversation ID
   * @param {string} customerId - Customer ID
   * @returns {Promise<Object>} Execution result
   */
  async executeRule(ruleId, conversationId, customerId) {
    if (!ruleId) {
      throw new Error('Rule ID is required');
    }

    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }

    if (!customerId) {
      throw new Error('Customer ID is required');
    }

    // Fetch rule
    const rule = await this.getRule(ruleId);

    // Fetch template
    const template = await TemplateService.getTemplate(rule.template_id);

    // Prepare context variables for template rendering
    const variables = {
      conversationId,
      customerId,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    };

    // Render template
    const renderedContent = await TemplateService.renderTemplate(rule.template_id, variables);

    // Create message record
    const message = await pb.collection('messages').create({
      conversation_id: conversationId,
      content: renderedContent,
      channel: rule.channel,
      direction: 'outbound',
      status: 'sent',
      sent_at: new Date().toISOString(),
      is_auto_reply: true,
      rule_id: ruleId,
    });

    // Update conversation last_message_at
    await pb.collection('conversations').update(conversationId, {
      last_message_at: new Date().toISOString(),
    });

    logger.info(`Auto-reply rule executed: ${ruleId} for conversation ${conversationId}`);

    return {
      success: true,
      messageId: message.id,
      content: renderedContent,
      sentAt: message.sent_at,
    };
  }

  /**
   * Get rules by channel
   * @param {string} organizationId - Organization ID
   * @param {string} channel - Channel name
   * @returns {Promise<Array>} Rules for the channel
   */
  async getRulesByChannel(organizationId, channel) {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    if (!channel) {
      throw new Error('Channel is required');
    }

    return this.getRules(organizationId, { channel });
  }

  /**
   * Get rules by trigger type
   * @param {string} organizationId - Organization ID
   * @param {string} triggerType - Trigger type
   * @returns {Promise<Array>} Rules with the trigger type
   */
  async getRulesByTrigger(organizationId, triggerType) {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    if (!triggerType) {
      throw new Error('Trigger type is required');
    }

    return this.getRules(organizationId, { trigger_type: triggerType });
  }

  /**
   * Sort rules by priority
   * @param {Array} rules - Array of rules
   * @returns {Array} Sorted rules (descending by priority)
   */
  sortRulesByPriority(rules) {
    if (!Array.isArray(rules)) {
      throw new Error('Rules must be an array');
    }

    return [...rules].sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }
}

export default new AutoReplyService();