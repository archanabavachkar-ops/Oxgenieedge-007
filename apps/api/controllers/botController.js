import botService from '../services/botService.js';
import logger from '../utils/logger.js';

class BotController {
  async respond(req, res) {
    try {
      const { message, conversationId } = req.validatedBody;

      const intentResult = await botService.detectIntent(message);

      const response = await botService.generateResponse(
        message,
        intentResult.intent,
        conversationId,
        intentResult.confidence
      );

      res.json({
        success: true,
        data: { ...response, ...intentResult },
      });
    } catch (error) {
      logger.error('Bot respond error', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  }

  async detectIntent(req, res) {
    try {
      const { message } = req.validatedBody;

      const result = await botService.detectIntent(message);

      res.json({ success: true, data: result });
    } catch (error) {
      logger.error('Detect intent error', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  }

  async getTemplates(req, res) {
    try {
      const templates = await botService.getTemplates();
      res.json({ success: true, data: templates });
    } catch (error) {
      logger.error('Get templates error', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  }

  async createTemplate(req, res) {
    try {
      const template = await botService.createTemplate(req.validatedBody);
      res.json({ success: true, data: template });
    } catch (error) {
      logger.error('Create template error', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  }

  async updateTemplate(req, res) {
    try {
      const { id } = req.params;

      const template = await botService.updateTemplate(
        id,
        req.validatedBody
      );

      res.json({ success: true, data: template });
    } catch (error) {
      logger.error('Update template error', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  }

  async deleteTemplate(req, res) {
    try {
      const { id } = req.params;

      await botService.deleteTemplate(id);

      res.json({ success: true });
    } catch (error) {
      logger.error('Delete template error', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  }
}

export default new BotController();