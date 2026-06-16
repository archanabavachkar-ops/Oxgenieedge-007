import { Router } from 'express';
import healthCheck from './health-check.js';
import integratedAiRouter from './integrated-ai.js';
import leadsRouter from './leads.js';
import whatsappRouter from './integrations/whatsapp.js';
import crmUsersRouter from './crm-users.js';
import notificationsRouter from './notifications.js';

export default function routes() {
  const router = Router();

  // Health check endpoint
  router.get('/health', healthCheck);

  // Integrated AI routes
  router.use('/integrated-ai', integratedAiRouter);

  // Leads CRUD endpoints
  router.use('/leads', leadsRouter);

  // Notifications endpoints
  router.use('/notifications', notificationsRouter);

  // WhatsApp integration
  router.use('/integrations/whatsapp', whatsappRouter);

  router.use('/crm-users', crmUsersRouter);

  return router;
}
