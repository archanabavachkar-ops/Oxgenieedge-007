
import express from 'express';
import { AutomationService } from '../services/AutomationService.js';
import logger from '../utils/logger.js';

const router = express.Router();

// POST /crm/automations/trigger - Process automation rules via Service Layer
router.post('/trigger', async (req, res, next) => {
  try {
    const { trigger, leadId, data } = req.body;

    if (!trigger || !leadId) {
      const err = new Error('Missing required fields: trigger, leadId');
      err.status = 400;
      throw err;
    }

    const executedActions = await AutomationService.triggerAutomation(trigger, leadId, data);
    res.json({
      success: true,
      executedActions,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
