import automationService from '../services/automationService.js';
import logger from '../utils/logger.js';

class AutomationController {
  async list(req, res) {
    try {
      const automations = await automationService.getAutomations();

      res.json({ success: true, data: automations });
    } catch (error) {
      logger.error('List automations error', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  }

  async create(req, res) {
    try {
      const automation = await automationService.createAutomation(req.validatedBody);

      res.json({ success: true, data: automation });
    } catch (error) {
      logger.error('Create automation error', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  }

  async getStats(req, res) {
    try {
      const stats = await automationService.getStatistics();

      res.json({ success: true, data: stats });
    } catch (error) {
      logger.error('Get automation stats error', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  }
}

export default new AutomationController();