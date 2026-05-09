
import express from 'express';
import { LeadService } from '../services/LeadService.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /contacts
 * Updated to use LeadService
 */
router.post('/', async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      const err = new Error('Request body is required');
      err.status = 400;
      throw err;
    }

    const { name, email, phone, company, source, message } = req.body;

    const leadData = {
      name,
      email,
      mobile: phone, // Map phone to mobile for the lead service
      company,
      source: source || 'Website Form',
      description: message,
      status: 'New Lead'
    };

    // LeadService handles validation and creation
    const createdContact = await LeadService.createLead(leadData);

    // Attempt auto-assignment quietly
    try {
      await LeadService.assignLead(createdContact.id);
    } catch (assignmentError) {
      logger.warn(`Failed to auto-assign contact ${createdContact.id}, skipping...`);
    }

    res.status(201).json({
      success: true,
      data: createdContact,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
