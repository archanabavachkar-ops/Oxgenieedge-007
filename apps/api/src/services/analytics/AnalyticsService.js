import 'dotenv/config';
import pb from '../../utils/pocketbaseClient.js';
import logger from '../../utils/logger.js';

/**
 * Analytics Service
 * Manages conversation metrics and analytics reporting
 */
export class AnalyticsService {
  /**
   * Get conversation metrics
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<Object>} Metrics object
   */
  async getConversationMetrics(conversationId) {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }

    const metrics = await pb.collection('conversation_metrics').getFirstListItem(
      `conversation_id = "${conversationId}"`
    );

    if (!metrics) {
      throw new Error('Conversation metrics not found');
    }

    logger.info(`Conversation metrics retrieved: ${conversationId}`);

    return {
      id: metrics.id,
      conversation_id: metrics.conversation_id,
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
      tags: metrics.tags ? JSON.parse(metrics.tags) : [],
    };
  }

  /**
   * Record conversation metrics
   * @param {string} conversationId - Conversation ID
   * @param {Object} data - Metrics data
   * @returns {Promise<Object>} Recorded metrics
   */
  async recordConversationMetrics(conversationId, data) {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }

    if (!data) {
      throw new Error('Metrics data is required');
    }

    // Check if metrics record already exists
    const existingMetrics = await pb.collection('conversation_metrics').getFullList({
      filter: `conversation_id = "${conversationId}"`,
    }).catch(() => []);

    const recordData = {
      conversation_id: conversationId,
      organization_id: data.organization_id,
      channel: data.channel,
      customer_id: data.customer_id,
      agent_id: data.agent_id,
      first_response_time: data.first_response_time,
      resolution_time: data.resolution_time,
      sla_met: data.sla_met,
      first_response_sla_met: data.first_response_sla_met,
      resolution_sla_met: data.resolution_sla_met,
      message_count: data.message_count,
      customer_satisfaction: data.customer_satisfaction,
      tags: data.tags ? JSON.stringify(data.tags) : '[]',
    };

    let result;
    if (existingMetrics.length > 0) {
      result = await pb.collection('conversation_metrics').update(existingMetrics[0].id, recordData);
    } else {
      result = await pb.collection('conversation_metrics').create(recordData);
    }

    logger.info(`Conversation metrics recorded: ${conversationId}`);

    return {
      id: result.id,
      conversation_id: result.conversation_id,
      sla_met: result.sla_met,
    };
  }

  /**
   * Get daily analytics for a specific date
   * @param {string} organizationId - Organization ID
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Object>} Daily analytics
   */
  async getDailyAnalytics(organizationId, date) {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    if (!date) {
      throw new Error('Date is required');
    }

    const analytics = await pb.collection('analytics_daily').getFirstListItem(
      `organization_id = "${organizationId}" && date = "${date}"`
    );

    if (!analytics) {
      throw new Error('Daily analytics not found for the specified date');
    }

    logger.info(`Daily analytics retrieved: ${organizationId} - ${date}`);

    return {
      id: analytics.id,
      date: analytics.date,
      total_conversations: analytics.total_conversations,
      total_messages: analytics.total_messages,
      avg_response_time: analytics.avg_response_time,
      avg_resolution_time: analytics.avg_resolution_time,
      sla_compliance_rate: analytics.sla_compliance_rate,
      avg_satisfaction: analytics.avg_satisfaction,
    };
  }

  /**
   * Get aggregated analytics for a date range
   * @param {string} organizationId - Organization ID
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Object>} Aggregated analytics
   */
  async getAnalyticsRange(organizationId, startDate, endDate) {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }

    const filter = `organization_id = "${organizationId}" && date >= "${startDate}" && date <= "${endDate}"`;

    const dailyAnalytics = await pb.collection('analytics_daily').getFullList({
      filter,
      sort: 'date',
    });

    if (dailyAnalytics.length === 0) {
      logger.warn(`No analytics found for organization ${organizationId} in range ${startDate} to ${endDate}`);
      return {
        total_conversations: 0,
        total_messages: 0,
        avg_response_time: 0,
        avg_resolution_time: 0,
        avg_sla_compliance_rate: 0,
        avg_satisfaction: 0,
      };
    }

    // Aggregate metrics
    const aggregated = dailyAnalytics.reduce(
      (acc, day) => ({
        total_conversations: acc.total_conversations + (day.total_conversations || 0),
        total_messages: acc.total_messages + (day.total_messages || 0),
        total_response_time: acc.total_response_time + (day.avg_response_time || 0),
        total_resolution_time: acc.total_resolution_time + (day.avg_resolution_time || 0),
        total_sla_compliance: acc.total_sla_compliance + (day.sla_compliance_rate || 0),
        total_satisfaction: acc.total_satisfaction + (day.avg_satisfaction || 0),
        days: acc.days + 1,
      }),
      {
        total_conversations: 0,
        total_messages: 0,
        total_response_time: 0,
        total_resolution_time: 0,
        total_sla_compliance: 0,
        total_satisfaction: 0,
        days: 0,
      }
    );

    logger.info(`Analytics range retrieved: ${organizationId} - ${startDate} to ${endDate}`);

    return {
      total_conversations: aggregated.total_conversations,
      total_messages: aggregated.total_messages,
      avg_response_time: aggregated.days > 0 ? Math.round(aggregated.total_response_time / aggregated.days) : 0,
      avg_resolution_time: aggregated.days > 0 ? Math.round(aggregated.total_resolution_time / aggregated.days) : 0,
      avg_sla_compliance_rate: aggregated.days > 0 ? Math.round(aggregated.total_sla_compliance / aggregated.days) : 0,
      avg_satisfaction: aggregated.days > 0 ? (aggregated.total_satisfaction / aggregated.days).toFixed(2) : 0,
    };
  }

  /**
   * Get analytics by channel
   * @param {string} organizationId - Organization ID
   * @param {string} channel - Channel name
   * @param {Object} dateRange - Date range {startDate, endDate}
   * @returns {Promise<Object>} Channel analytics
   */
  async getChannelAnalytics(organizationId, channel, dateRange = {}) {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    if (!channel) {
      throw new Error('Channel is required');
    }

    let filter = `organization_id = "${organizationId}" && channel = "${channel}"`;

    if (dateRange.startDate && dateRange.endDate) {
      filter += ` && created >= "${dateRange.startDate}" && created <= "${dateRange.endDate}"`;
    }

    const metrics = await pb.collection('conversation_metrics').getFullList({
      filter,
    });

    if (metrics.length === 0) {
      return {
        channel,
        total_conversations: 0,
        avg_response_time: 0,
        avg_resolution_time: 0,
        avg_satisfaction: 0,
        sla_compliance_rate: 0,
      };
    }

    const aggregated = metrics.reduce(
      (acc, m) => ({
        total_conversations: acc.total_conversations + 1,
        total_response_time: acc.total_response_time + (m.first_response_time || 0),
        total_resolution_time: acc.total_resolution_time + (m.resolution_time || 0),
        total_satisfaction: acc.total_satisfaction + (m.customer_satisfaction || 0),
        sla_met_count: acc.sla_met_count + (m.sla_met ? 1 : 0),
      }),
      {
        total_conversations: 0,
        total_response_time: 0,
        total_resolution_time: 0,
        total_satisfaction: 0,
        sla_met_count: 0,
      }
    );

    logger.info(`Channel analytics retrieved: ${organizationId} - ${channel}`);

    return {
      channel,
      total_conversations: aggregated.total_conversations,
      avg_response_time: Math.round(aggregated.total_response_time / aggregated.total_conversations),
      avg_resolution_time: Math.round(aggregated.total_resolution_time / aggregated.total_conversations),
      avg_satisfaction: (aggregated.total_satisfaction / aggregated.total_conversations).toFixed(2),
      sla_compliance_rate: Math.round((aggregated.sla_met_count / aggregated.total_conversations) * 100),
    };
  }

  /**
   * Get analytics by agent
   * @param {string} organizationId - Organization ID
   * @param {string} agentId - Agent ID
   * @param {Object} dateRange - Date range {startDate, endDate}
   * @returns {Promise<Object>} Agent analytics
   */
  async getAgentAnalytics(organizationId, agentId, dateRange = {}) {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    if (!agentId) {
      throw new Error('Agent ID is required');
    }

    let filter = `organization_id = "${organizationId}" && agent_id = "${agentId}"`;

    if (dateRange.startDate && dateRange.endDate) {
      filter += ` && created >= "${dateRange.startDate}" && created <= "${dateRange.endDate}"`;
    }

    const metrics = await pb.collection('conversation_metrics').getFullList({
      filter,
    });

    if (metrics.length === 0) {
      return {
        agent_id: agentId,
        conversations_handled: 0,
        avg_response_time: 0,
        avg_resolution_time: 0,
        avg_satisfaction: 0,
      };
    }

    const aggregated = metrics.reduce(
      (acc, m) => ({
        conversations_handled: acc.conversations_handled + 1,
        total_response_time: acc.total_response_time + (m.first_response_time || 0),
        total_resolution_time: acc.total_resolution_time + (m.resolution_time || 0),
        total_satisfaction: acc.total_satisfaction + (m.customer_satisfaction || 0),
      }),
      {
        conversations_handled: 0,
        total_response_time: 0,
        total_resolution_time: 0,
        total_satisfaction: 0,
      }
    );

    logger.info(`Agent analytics retrieved: ${organizationId} - ${agentId}`);

    return {
      agent_id: agentId,
      conversations_handled: aggregated.conversations_handled,
      avg_response_time: Math.round(aggregated.total_response_time / aggregated.conversations_handled),
      avg_resolution_time: Math.round(aggregated.total_resolution_time / aggregated.conversations_handled),
      avg_satisfaction: (aggregated.total_satisfaction / aggregated.conversations_handled).toFixed(2),
    };
  }

  /**
   * Get SLA compliance metrics
   * @param {string} organizationId - Organization ID
   * @param {Object} dateRange - Date range {startDate, endDate}
   * @returns {Promise<Object>} Compliance metrics
   */
  async getSLACompliance(organizationId, dateRange = {}) {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    let filter = `organization_id = "${organizationId}"`;

    if (dateRange.startDate && dateRange.endDate) {
      filter += ` && created >= "${dateRange.startDate}" && created <= "${dateRange.endDate}"`;
    }

    const metrics = await pb.collection('conversation_metrics').getFullList({
      filter,
    });

    if (metrics.length === 0) {
      return {
        compliance_rate: 0,
        total_conversations: 0,
        met_sla: 0,
      };
    }

    const metSLA = metrics.filter((m) => m.sla_met).length;
    const complianceRate = Math.round((metSLA / metrics.length) * 100);

    logger.info(`SLA compliance retrieved: ${organizationId} - ${complianceRate}%`);

    return {
      compliance_rate: complianceRate,
      total_conversations: metrics.length,
      met_sla: metSLA,
    };
  }

  /**
   * Get customer satisfaction metrics
   * @param {string} organizationId - Organization ID
   * @param {Object} dateRange - Date range {startDate, endDate}
   * @returns {Promise<Object>} Satisfaction metrics
   */
  async getCustomerSatisfaction(organizationId, dateRange = {}) {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    let filter = `organization_id = "${organizationId}" && customer_satisfaction > 0`;

    if (dateRange.startDate && dateRange.endDate) {
      filter += ` && created >= "${dateRange.startDate}" && created <= "${dateRange.endDate}"`;
    }

    const metrics = await pb.collection('conversation_metrics').getFullList({
      filter,
    });

    if (metrics.length === 0) {
      return {
        avg_satisfaction: 0,
        total_ratings: 0,
      };
    }

    const totalSatisfaction = metrics.reduce((sum, m) => sum + (m.customer_satisfaction || 0), 0);
    const avgSatisfaction = (totalSatisfaction / metrics.length).toFixed(2);

    logger.info(`Customer satisfaction retrieved: ${organizationId} - ${avgSatisfaction}`);

    return {
      avg_satisfaction: parseFloat(avgSatisfaction),
      total_ratings: metrics.length,
    };
  }

  /**
   * Generate analytics report
   * @param {string} organizationId - Organization ID
   * @param {string} reportType - Report type (daily, weekly, monthly, channel, agent)
   * @param {Object} dateRange - Date range {startDate, endDate}
   * @returns {Promise<Object>} Report object
   */
  async generateReport(organizationId, reportType, dateRange = {}) {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    if (!reportType) {
      throw new Error('Report type is required');
    }

    const validReportTypes = ['daily', 'weekly', 'monthly', 'channel', 'agent'];
    if (!validReportTypes.includes(reportType)) {
      throw new Error(`Invalid report type. Must be one of: ${validReportTypes.join(', ')}`);
    }

    let reportData = {};

    switch (reportType) {
      case 'daily':
      case 'weekly':
      case 'monthly': {
        reportData = await this.getAnalyticsRange(organizationId, dateRange.startDate, dateRange.endDate);
        break;
      }
      case 'channel': {
        // Get analytics for all channels
        const metrics = await pb.collection('conversation_metrics').getFullList({
          filter: `organization_id = "${organizationId}"`,
        });
        const channels = [...new Set(metrics.map((m) => m.channel))];
        reportData.channels = await Promise.all(
          channels.map((channel) => this.getChannelAnalytics(organizationId, channel, dateRange))
        );
        break;
      }
      case 'agent': {
        // Get analytics for all agents
        const agentMetrics = await pb.collection('conversation_metrics').getFullList({
          filter: `organization_id = "${organizationId}"`,
        });
        const agents = [...new Set(agentMetrics.map((m) => m.agent_id).filter(Boolean))];
        reportData.agents = await Promise.all(
          agents.map((agentId) => this.getAgentAnalytics(organizationId, agentId, dateRange))
        );
        break;
      }
    }

    logger.info(`Report generated: ${organizationId} - ${reportType}`);

    return {
      reportType,
      generatedAt: new Date().toISOString(),
      dateRange,
      summary: reportData,
    };
  }

  /**
   * Aggregate daily analytics
   * @param {string} organizationId - Organization ID
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Object>} Aggregated daily analytics
   */
  async aggregateDailyAnalytics(organizationId, date) {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    if (!date) {
      throw new Error('Date is required');
    }

    // Get all metrics for the day
    const startOfDay = `${date}T00:00:00.000Z`;
    const endOfDay = `${date}T23:59:59.999Z`;

    const metrics = await pb.collection('conversation_metrics').getFullList({
      filter: `organization_id = "${organizationId}" && created >= "${startOfDay}" && created <= "${endOfDay}"`,
    });

    if (metrics.length === 0) {
      logger.warn(`No metrics found for ${organizationId} on ${date}`);
      return null;
    }

    // Aggregate metrics
    const aggregated = metrics.reduce(
      (acc, m) => ({
        total_conversations: acc.total_conversations + 1,
        total_messages: acc.total_messages + (m.message_count || 0),
        total_response_time: acc.total_response_time + (m.first_response_time || 0),
        total_resolution_time: acc.total_resolution_time + (m.resolution_time || 0),
        total_satisfaction: acc.total_satisfaction + (m.customer_satisfaction || 0),
        sla_met_count: acc.sla_met_count + (m.sla_met ? 1 : 0),
      }),
      {
        total_conversations: 0,
        total_messages: 0,
        total_response_time: 0,
        total_resolution_time: 0,
        total_satisfaction: 0,
        sla_met_count: 0,
      }
    );

    const dailyAnalytics = {
      organization_id: organizationId,
      date,
      total_conversations: aggregated.total_conversations,
      total_messages: aggregated.total_messages,
      avg_response_time: Math.round(aggregated.total_response_time / aggregated.total_conversations),
      avg_resolution_time: Math.round(aggregated.total_resolution_time / aggregated.total_conversations),
      sla_compliance_rate: Math.round((aggregated.sla_met_count / aggregated.total_conversations) * 100),
      avg_satisfaction: aggregated.total_satisfaction > 0
        ? (aggregated.total_satisfaction / aggregated.total_conversations).toFixed(2)
        : 0,
    };

    // Check if daily analytics record already exists
    const existingAnalytics = await pb.collection('analytics_daily').getFullList({
      filter: `organization_id = "${organizationId}" && date = "${date}"`,
    }).catch(() => []);

    let result;
    if (existingAnalytics.length > 0) {
      result = await pb.collection('analytics_daily').update(existingAnalytics[0].id, dailyAnalytics);
    } else {
      result = await pb.collection('analytics_daily').create(dailyAnalytics);
    }

    logger.info(`Daily analytics aggregated: ${organizationId} - ${date}`);

    return result;
  }
}

export default new AnalyticsService();