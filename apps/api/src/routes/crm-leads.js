import express from 'express';
import { LeadService } from '../services/LeadService.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GET ALL LEADS
router.get('/', async (req, res, next) => {
  try {

    const leads = await LeadService.getAllLeads();

    res.json({
      success: true,
      data: leads
    });

  } catch (error) {
    logger.error('GET LEADS ERROR:', error);
    next(error);
  }
});

// CREATE LEAD
router.post('/', async (req, res, next) => {
  try {

    const createdLead = await LeadService.createLead(req.body);

    await LeadService.assignLead(createdLead.id);

    res.status(201).json({
      success: true,
      data: createdLead
    });

  } catch (error) {
    logger.error('CREATE LEAD ERROR:', error);
    next(error);
  }
});

// LEAD SCORING
router.post('/score', async (req, res, next) => {
  try {

    const { leadId } = req.body;

    if (!leadId || typeof leadId !== 'string') {
      const err = new Error('Missing or invalid leadId');
      err.status = 400;
      throw err;
    }

    res.json({
      success: true,
      leadId,
      score: 85,
      category: 'Hot',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    next(error);
  }
});

export default router;