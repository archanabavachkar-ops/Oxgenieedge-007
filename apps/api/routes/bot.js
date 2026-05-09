import express from 'express';
import botController from '../controllers/botController.js';
import { validate } from '../middleware/validate.js';
import { botSchema, detectIntentSchema, createTemplateSchema } from '../utils/schemas.js';

const router = express.Router();

// Bot
router.post('/respond', validate(botSchema), botController.respond);
router.post('/detect-intent', validate(detectIntentSchema), botController.detectIntent);

// Templates
router.get('/templates', botController.getTemplates);
router.post('/templates', validate(createTemplateSchema), botController.createTemplate);
router.put('/templates/:id', validate(createTemplateSchema), botController.updateTemplate);
router.delete('/templates/:id', botController.deleteTemplate);

export default router;