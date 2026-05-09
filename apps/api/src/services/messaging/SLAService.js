import 'dotenv/config';
import pb from '../../utils/pocketbaseClient.js';
import logger from '../../utils/logger.js';

/**
 * SLA Service
 * Manages Service Level Agreements for messaging
 */
export class SLAService {
  /**
   * Create SLA policy
   */
  async createSLAPolicy(name, channel, firstResponseTime, resolutionTime) {
    if (!name || !channel || !firstResponseTime || !resolutionTime) {
      throw new Error('Name, channel, firstResponseTime, and resolutionTime are required');
    }

    try {
      const policy = await pb.collection('sla_policies').create({
        name,
        channel,
        first_response_time: firstResponseTime, // in minutes
        resolution_time: resolutionTime, // in minutes
        enabled: true,
        created_at: new Date().toISOString(),
      });

      logger.info(`SLA policy created: ${policy.id} - ${name}`);

      return {
        policyId: policy.id,
        name: policy.name,
        channel: policy.channel,
        firstResponseTime: policy.first_response_time,
        resolutionTime: policy.resolution_time,
        enabled: policy.enabled,
      };
    } catch (error) {
      logger.error(`Failed to create SLA policy: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get SLA policies for a channel
   */
  async getSLAPolicies(channel) {
    if (!channel) {
      throw new Error('Channel is required');
    }

    try {
      const policies = await pb.collection('sla_policies').getFullList({
        filter: `channel = "${channel}" && enabled = true`,
        sort: '-created_at',
      });

      logger.info(`SLA policies retrieved for channel ${channel}: ${policies.length}`);

      return policies.map((p) => ({
        policyId: p.id,
        name: p.name,
        channel: p.channel,
        firstResponseTime: p.first_response_time,
        resolutionTime: p.resolution_time,
        enabled: p.enabled,
        createdAt: p.created_at,
      }));
    } catch (error) {
      logger.error(`Failed to get SLA policies: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check SLA compliance for a conversation
   */
  async checkSLACompliance(conversationId) {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }

    try {
      const conversation = await pb.collection('conversations').getOne(conversationId);

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Get SLA policy for this channel
      const policies = await this.getSLAPolicies(conversation.channel);
      if (policies.length === 0) {
        return {
          conversationId,
          compliant: true,
          reason: 'No SLA policy defined for this channel',
        };
      }

      const policy = policies[0];

      // Get messages
      const messages = await pb.collection('messages').getFullList({
        filter: `conversation_id = "${conversationId}"`,
        sort: 'received_at',
      });

      if (messages.length === 0) {
        return {
          conversationId,
          compliant: true,
          reason: 'No messages in conversation',
        };
      }

      // Find first inbound message
      const firstInboundMessage = messages.find((m) => m.direction === 'inbound');
      if (!firstInboundMessage) {
        return {
          conversationId,
          compliant: true,
          reason: 'No inbound messages',
        };
      }

      // Find first outbound response
      const firstOutboundIndex = messages.findIndex(
        (m) => m.direction === 'outbound' && new Date(m.sent_at) > new Date(firstInboundMessage.received_at)
      );

      let firstResponseCompliant = true;
      let firstResponseTime = null;

      if (firstOutboundIndex !== -1) {
        const firstOutboundMessage = messages[firstOutboundIndex];
        const responseTime = new Date(firstOutboundMessage.sent_at) - new Date(firstInboundMessage.received_at);
        firstResponseTime = Math.round(responseTime / 1000 / 60); // in minutes
        firstResponseCompliant = firstResponseTime <= policy.firstResponseTime;
      }

      // Check resolution time
      let resolutionCompliant = true;
      let resolutionTime = null;

      if (conversation.status === 'closed' && conversation.closed_at) {
        const resolution = new Date(conversation.closed_at) - new Date(firstInboundMessage.received_at);
        resolutionTime = Math.round(resolution / 1000 / 60); // in minutes
        resolutionCompliant = resolutionTime <= policy.resolutionTime;
      }

      const compliant = firstResponseCompliant && resolutionCompliant;

      logger.info(`SLA compliance checked: ${conversationId} - ${compliant ? 'compliant' : 'breached'}`);

      return {
        conversationId,
        compliant,
        reason: compliant ? 'SLA met' : 'SLA breached',
        firstResponseTime,
        firstResponseCompliant,
        firstResponseSLA: policy.firstResponseTime,
        resolutionTime,
        resolutionCompliant,
        resolutionSLA: policy.resolutionTime,
      };
    } catch (error) {
      logger.error(`Failed to check SLA compliance: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get SLA metrics for a channel
   */
  async getSLAMetrics(channel) {
    if (!channel) {
      throw new Error('Channel is required');
    }

    try {
      const conversations = await pb.collection('conversations').getFullList({
        filter: `channel = "${channel}"`,
      });

      let compliantCount = 0;
      let breachedCount = 0;

      for (const conversation of conversations) {
        const compliance = await this.checkSLACompliance(conversation.id);
        if (compliance.compliant) {
          compliantCount++;
        } else {
          breachedCount++;
        }
      }

      const totalConversations = conversations.length;
      const complianceRate = totalConversations > 0 ? ((compliantCount / totalConversations) * 100).toFixed(2) : 0;

      logger.info(`SLA metrics retrieved for channel ${channel}`);

      return {
        channel,
        totalConversations,
        compliant: compliantCount,
        breached: breachedCount,
        complianceRate: parseFloat(complianceRate),
      };
    } catch (error) {
      logger.error(`Failed to get SLA metrics: ${error.message}`);
      throw error;
    }
  }
}

export default new SLAService();