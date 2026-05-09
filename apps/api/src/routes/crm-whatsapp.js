
import express from 'express';
import { WhatsAppService } from '../services/WhatsAppService.js';
import logger from '../utils/logger.js';

const router = express.Router();

// POST /crm/whatsapp/send - Send WhatsApp message via Service Layer
router.post('/send', async (req, res, next) => {
  try {
    const { leadId, message, personalizationTokens } = req.body;

    if (!leadId || !message) {
      const err = new Error('Missing required fields: leadId, message');
      err.status = 400;
      throw err;
    }

    const result = await WhatsAppService.sendMessage(leadId, message, personalizationTokens);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

export default router;
