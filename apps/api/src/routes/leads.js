import express from 'express';
import { LeadService } from '../services/LeadService.js';

const router = express.Router();

// GET all leads
router.get('/', async (req, res, next) => {
  try {

    const leads = await LeadService.getAllLeads();

    res.json({
      success: true,
      data: leads
    });

  } catch (error) {
    next(error);
  }
});

export default router;