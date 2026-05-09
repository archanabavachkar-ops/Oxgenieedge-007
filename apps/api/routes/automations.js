import express from 'express';
import automationController from '../controllers/automationController.js';
import { validate } from '../middleware/validate.js';
import { createAutomationSchema } from '../utils/schemas.js';

const router = express.Router();

// Get all automations
router.get('/', automationController.list);

// Create automation (RESTful: POST /)
router.post('/', validate(createAutomationSchema), automationController.create);

// Get stats
router.get('/stats', automationController.getStats);

export default router;