import express from 'express';
import escalationController from '../controllers/escalationController.js';
import { validate } from '../middleware/validate.js';
import { escalateSchema } from '../utils/schemas.js';

const router = express.Router();

// Create escalation
router.post('/create', validate(escalateSchema), escalationController.create);

// List escalations
router.get('/', escalationController.list);

// Assign escalation to agent
router.post('/:id/assign', escalationController.assign);

// Resolve escalation
router.post('/:id/resolve', escalationController.resolve);

// Get escalation statistics
router.get('/stats', escalationController.getStats);

export default router;