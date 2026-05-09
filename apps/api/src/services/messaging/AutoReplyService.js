import 'dotenv/config';
import pb from '../../utils/pocketbaseClient.js';
import logger from '../../utils/logger.js';

/**
 * Auto-Reply Service
 * Manages automatic reply rules for incoming messages
 */
export class AutoReplyService {
  /**
   * Create auto-reply rule
   */
  async createAutoReply(name, channel, trigger, response, conditions = {}) {
    if (!name || !channel || !trigger || !response) {
      throw new Error('Name, channel, trigger, and response are required');
    }

    try {
      const autoReply = await pb.collection('auto_replies').create({
        name,
        channel,
        trigger,
        response,
        conditions: JSON.stringify(conditions),
        enabled: true,
        created_at: new Date().toISOString(),
      });

      logger.info(`Auto-reply created: ${autoReply.id} - ${name}`);

      return {
        ruleId: autoReply.id,
        name: autoReply.name,
        channel: autoReply.channel,
        trigger: autoReply.trigger,
        response: autoReply.response,
        conditions: JSON.parse(autoReply.conditions),
        enabled: autoReply.enabled,
      };
    } catch (error) {
      logger.error(`Failed to create auto-reply: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get auto-replies for a channel
   */
  async getAutoReplies(channel) {
    if (!channel) {
      throw new Error('Channel is required');
    }

    try {
      const autoReplies = await pb.collection('auto_replies').getFullList({
        filter: `channel = "${channel}" && enabled = true`,
        sort: '-created_at',
      });

      logger.info(`Auto-replies retrieved for channel ${channel}: ${autoReplies.length}`);

      return autoReplies.map((ar) => ({
        ruleId: ar.id,
        name: ar.name,
        channel: ar.channel,
        trigger: ar.trigger,
        response: ar.response,
        conditions: JSON.parse(ar.conditions || '{}'),
        enabled: ar.enabled,
        createdAt: ar.created_at,
      }));
    } catch (error) {
      logger.error(`Failed to get auto-replies: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if message should trigger auto-reply
   */
  async shouldTrigger(message, channel) {
    if (!message || !channel) {
      throw new Error('Message and channel are required');
    }

    try {
      const autoReplies = await this.getAutoReplies(channel);

      for (const rule of autoReplies) {
        if (this.matchesTrigger(message, rule.trigger)) {
          return rule;
        }
      }

      return null;
    } catch (error) {
      logger.error(`Failed to check trigger: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send auto-reply
   */
  async sendAutoReply(conversationId, customerId, response, channel) {
    if (!conversationId || !customerId || !response || !channel) {
      throw new Error('Conversation ID, customer ID, response, and channel are required');
    }

    try {
      // Create message record
      const messageRecord = await pb.collection('messages').create({
        conversation_id: conversationId,
        contact_id: customerId,
        channel,
        content: response,
        direction: 'outbound',
        status: 'sent',
        sent_at: new Date().toISOString(),
        is_auto_reply: true,
      });

      logger.info(`Auto-reply sent: ${messageRecord.id}`);

      return {
        messageId: messageRecord.id,
        conversationId,
        status: 'sent',
      };
    } catch (error) {
      logger.error(`Failed to send auto-reply: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update auto-reply rule
   */
  async updateAutoReply(ruleId, name, trigger, response, conditions = {}) {
    if (!ruleId) {
      throw new Error('Rule ID is required');
    }

    try {
      const rule = await pb.collection('auto_replies').getOne(ruleId);

      if (!rule) {
        throw new Error('Auto-reply rule not found');
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (trigger) updateData.trigger = trigger;
      if (response) updateData.response = response;
      if (conditions) updateData.conditions = JSON.stringify(conditions);
      updateData.updated_at = new Date().toISOString();

      const updatedRule = await pb.collection('auto_replies').update(ruleId, updateData);

      logger.info(`Auto-reply updated: ${ruleId}`);

      return {
        ruleId: updatedRule.id,
        name: updatedRule.name,
        trigger: updatedRule.trigger,
        response: updatedRule.response,
        conditions: JSON.parse(updatedRule.conditions),
      };
    } catch (error) {
      logger.error(`Failed to update auto-reply: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete auto-reply rule
   */
  async deleteAutoReply(ruleId) {
    if (!ruleId) {
      throw new Error('Rule ID is required');
    }

    try {
      const rule = await pb.collection('auto_replies').getOne(ruleId);

      if (!rule) {
        throw new Error('Auto-reply rule not found');
      }

      await pb.collection('auto_replies').delete(ruleId);

      logger.info(`Auto-reply deleted: ${ruleId}`);

      return {
        success: true,
        ruleId,
      };
    } catch (error) {
      logger.error(`Failed to delete auto-reply: ${error.message}`);
      throw error;
    }
  }

  /**
   * Match message against trigger
   */
  matchesTrigger(message, trigger) {
    if (!message || !trigger) {
      return false;
    }

    const messageLower = message.toLowerCase();
    const triggerLower = trigger.toLowerCase();

    // Exact match
    if (messageLower === triggerLower) {
      return true;
    }

    // Contains match
    if (messageLower.includes(triggerLower)) {
      return true;
    }

    // Keyword match (split by spaces)
    const keywords = triggerLower.split(/\s+/);
    if (keywords.every((keyword) => messageLower.includes(keyword))) {
      return true;
    }

    return false;
  }
}

export default new AutoReplyService();