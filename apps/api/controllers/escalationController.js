import escalationService from '../services/escalationService.js';
import logger from '../utils/logger.js';

class EscalationController {
  async create(req, res) {
    try {
      const escalation = await escalationService.createEscalation(req.validatedBody);

      res.json({ success: true, data: escalation });
    } catch (error) {
      logger.error('Create escalation error', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  }

  async list(req, res) {
    try {
      const escalations = await escalationService.getEscalations(req.query);

      res.json({ success: true, data: escalations });
    } catch (error) {
      logger.error('List escalations error', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  }

  async assign(req, res) {
    try {
      const { id } = req.params;
      const { agentId } = req.validatedBody;

      const escalation = await escalationService.assignToAgent(id, agentId);

      res.json({ success: true, data: escalation });
    } catch (error) {
      logger.error('Assign escalation error', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  }

  async resolve(req, res) {
    try {
      const { id } = req.params;
      const { resolution } = req.validatedBody;

      const escalation = await escalationService.resolveEscalation(id, resolution);

      res.json({ success: true, data: escalation });
    } catch (error) {
      logger.error('Resolve escalation error', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  }

  async getStats(req, res) {
    try {
      const stats = await escalationService.getStatistics();

      res.json({ success: true, data: stats });
    } catch (error) {
      logger.error('Get escalation stats error', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  }
}

export default new EscalationController();