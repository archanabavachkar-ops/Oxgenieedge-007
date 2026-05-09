import 'dotenv/config';
import pb from '../config/pocketbase.js';
import logger from '../utils/logger.js';

class AnalyticsService {
  /**
   * Get bot performance metrics
   * @returns {Promise<Object>} Bot metrics including response time, accuracy, and usage
   */
  async getBotMetrics() {
    try {
      // Fetch all bot interactions
      const messages = await pb.collection('messages').getFullList({
        filter: 'sender_type = "bot"',
      }).catch(() => []);

      // Fetch all conversations
      const conversations = await pb.collection('conversations').getFullList().catch(() => []);

      // Calculate metrics
      const totalBotMessages = messages.length;
      const totalConversations = conversations.length;
      const avgMessagesPerConversation = totalConversations > 0 ? (totalBotMessages / totalConversations).toFixed(2) : 0;

      // Calculate escalation rate (conversations that were escalated)
      const escalatedConversations = conversations.filter((c) => c.status === 'escalated').length;
      const escalationRate = totalConversations > 0 ? ((escalatedConversations / totalConversations) * 100).toFixed(2) : 0;

      // Calculate average response time (simplified - using message creation time)
      let totalResponseTime = 0;
      let responseCount = 0;

      for (const message of messages) {
        if (message.created) {
          totalResponseTime += new Date(message.created).getTime();
          responseCount++;
        }
      }

      const avgResponseTime = responseCount > 0 ? (totalResponseTime / responseCount).toFixed(0) : 0;

      logger.info('Bot metrics retrieved');

      return {
        totalBotMessages,
        totalConversations,
        avgMessagesPerConversation: parseFloat(avgMessagesPerConversation),
        escalationRate: parseFloat(escalationRate),
        avgResponseTime: parseInt(avgResponseTime),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Get bot metrics error', error);
      throw error;
    }
  }

  /**
   * Get conversation analytics
   * @returns {Promise<Object>} Conversation metrics including count, status distribution, and duration
   */
  async getConversationMetrics() {
    try {
      // Fetch all conversations
      const conversations = await pb.collection('conversations').getFullList().catch(() => []);

      // Count by status
      const statusCounts = {
        active: 0,
        closed: 0,
        escalated: 0,
        pending: 0,
      };

      conversations.forEach((conv) => {
        const status = conv.status || 'pending';
        if (Object.prototype.hasOwnProperty.call(statusCounts, status)) {
          statusCounts[status]++;
        }
      });

      // Count by channel
      const channelCounts = {};
      conversations.forEach((conv) => {
        const channel = conv.channel || 'unknown';
        channelCounts[channel] = (channelCounts[channel] || 0) + 1;
      });

      // Calculate average conversation duration
      let totalDuration = 0;
      let durationCount = 0;

      for (const conv of conversations) {
        if (conv.created && conv.updated) {
          const createdDate = new Date(conv.created);
          const updatedDate = new Date(conv.updated);
          const duration = Math.floor((updatedDate - createdDate) / 1000); // in seconds
          totalDuration += duration;
          durationCount++;
        }
      }

      const avgDuration = durationCount > 0 ? (totalDuration / durationCount).toFixed(0) : 0;

      // Calculate unread count
      const unreadConversations = conversations.filter((c) => (c.unread_count || 0) > 0).length;

      logger.info('Conversation metrics retrieved');

      return {
        totalConversations: conversations.length,
        statusDistribution: statusCounts,
        channelDistribution: channelCounts,
        avgDurationSeconds: parseInt(avgDuration),
        unreadConversations,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Get conversation metrics error', error);
      throw error;
    }
  }

  /**
   * Get escalation metrics
   * @returns {Promise<Object>} Escalation data including count, reasons, and resolution time
   */
  async getEscalationMetrics() {
    try {
      // Fetch all escalations
      const escalations = await pb.collection('escalations').getFullList().catch(() => []);

      // Count by status
      const statusCounts = {
        pending: 0,
        active: 0,
        resolved: 0,
      };

      escalations.forEach((esc) => {
        const status = esc.status || 'pending';
        if (Object.prototype.hasOwnProperty.call(statusCounts, status)) {
          statusCounts[status]++;
        }
      });

      // Count by priority
      const priorityCounts = {
        low: 0,
        medium: 0,
        high: 0,
      };

      escalations.forEach((esc) => {
        const priority = esc.priority || 'medium';
        if (Object.prototype.hasOwnProperty.call(priorityCounts, priority)) {
          priorityCounts[priority]++;
        }
      });

      // Calculate average resolution time
      let totalResolutionTime = 0;
      let resolvedCount = 0;

      for (const esc of escalations) {
        if (esc.status === 'resolved' && esc.created_at && esc.resolved_at) {
          const createdDate = new Date(esc.created_at);
          const resolvedDate = new Date(esc.resolved_at);
          const resolutionTime = Math.floor((resolvedDate - createdDate) / 1000); // in seconds
          totalResolutionTime += resolutionTime;
          resolvedCount++;
        }
      }

      const avgResolutionTime = resolvedCount > 0 ? (totalResolutionTime / resolvedCount).toFixed(0) : 0;

      // Calculate escalation rate (escalations / total conversations)
      const conversations = await pb.collection('conversations').getFullList().catch(() => []);
      const escalationRate = conversations.length > 0 ? ((escalations.length / conversations.length) * 100).toFixed(2) : 0;

      logger.info('Escalation metrics retrieved');

      return {
        totalEscalations: escalations.length,
        statusDistribution: statusCounts,
        priorityDistribution: priorityCounts,
        avgResolutionTimeSeconds: parseInt(avgResolutionTime),
        escalationRate: parseFloat(escalationRate),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Get escalation metrics error', error);
      throw error;
    }
  }
}

export default new AnalyticsService();