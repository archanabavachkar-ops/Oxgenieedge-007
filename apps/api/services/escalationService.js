import pb from '../config/pocketbase.js';
import logger from '../utils/logger.js';
import eventBus from './eventBus.js';

class EscalationService {
  async createEscalation(data) {
    try {
      const escalation = await pb.collection('escalations').create({
        conversation_id: data.conversationId,
        escalation_reason: data.reason,
        priority: data.priority || 'medium',
        status: 'pending',
        created_at: new Date().toISOString(),
      });

      // Update conversation status
      await pb.collection('conversations').update(data.conversationId, {
        status: 'escalated',
      });

      logger.info('Escalation created', {
        escalationId: escalation.id,
        conversationId: data.conversationId,
      });

      eventBus.emit('escalation.created', escalation);

      return escalation;
    } catch (error) {
      logger.error('Create escalation error', error);
      throw error;
    }
  }

  async getEscalations(filters = {}) {
    try {
      const conditions = [];

      if (filters.status) {
        conditions.push(`status = "${filters.status}"`);
      }

      if (filters.priority) {
        conditions.push(`priority = "${filters.priority}"`);
      }

      const filterQuery = conditions.join(' && ');

      return await pb.collection('escalations').getFullList({
        filter: filterQuery || undefined,
        sort: '-created_at',
      });
    } catch (error) {
      logger.error('Get escalations error', error);
      return [];
    }
  }

  async assignToAgent(escalationId, agentId) {
    try {
      const escalation = await pb.collection('escalations').update(escalationId, {
        agent_id: agentId,
        status: 'active',
        assigned_at: new Date().toISOString(),
      });

      logger.info('Escalation assigned', { escalationId, agentId });

      eventBus.emit('escalation.assigned', escalation);

      return escalation;
    } catch (error) {
      logger.error('Assign escalation error', error);
      throw error;
    }
  }

  async resolveEscalation(escalationId, resolution) {
    try {
      const escalation = await pb.collection('escalations').update(escalationId, {
        status: 'resolved',
        resolution,
        resolved_at: new Date().toISOString(),
      });

      logger.info('Escalation resolved', { escalationId });

      eventBus.emit('escalation.resolved', escalation);

      return escalation;
    } catch (error) {
      logger.error('Resolve escalation error', error);
      throw error;
    }
  }

  async getStatistics() {
    try {
      const escalations = await pb.collection('escalations').getFullList();

      return {
        total: escalations.length,
        pending: escalations.filter(e => e.status === 'pending').length,
        active: escalations.filter(e => e.status === 'active').length,
        resolved: escalations.filter(e => e.status === 'resolved').length,
      };
    } catch (error) {
      logger.error('Get escalation stats error', error);
      return {};
    }
  }
}

export default new EscalationService();