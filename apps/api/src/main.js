
import dotenv from 'dotenv';
dotenv.config();
console.log('===== NEW MAIN.JS LOADED =====');

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { contactLimiter, integrationLimiter, whatsappLimiter } from './middleware/rateLimiter.js';

// import routes from './routes/index.js';
// import contactsRouter from './routes/integrations/contacts.js';
// import facebookRouter from './routes/integrations/facebook.js';
// import whatsappRouter from './routes/integrations/whatsapp.js';
import { errorHandler } from './middleware/errorHandler.js';
import logger from '../utils/logger.js';

const app = express();

app.set('trust proxy', true);

// Graceful shutdown and process handlers
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION');
  console.error('Promise:', promise);
  console.error('Reason:', reason);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received. Shutting down gracefully.');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received. Shutting down gracefully.');
  await new Promise((resolve) => setTimeout(resolve, 3000));
  logger.info('Exiting');
  process.exit(0);
});

// Middleware Stack - Must follow specific order
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiters - Applied BEFORE routes
app.use('/api/contacts', contactLimiter);
app.use('/api/integrations', integrationLimiter);
app.use('/api/integrations/whatsapp', whatsappLimiter);

// Mount routes at /hcgi/api to match frontend's apiServerClient base URL
// app.use('/hcgi/api', routes());

// Also mount at /api for backward compatibility
app.get('/api/leads', (req, res) => {
  res.json({
    success: true,
    message: 'API working'
  });
});

// Mount integration routers with rate limiters applied
// app.use('/api/integrations', contactsRouter);
// app.use('/api/integrations/facebook', facebookRouter);
// app.use('/api/integrations/whatsapp', whatsappRouter);

// 404 Catch-All (AFTER routes)
app.use((req, res, next) => {
  const err = new Error('Route not found');
  err.status = 404;
  next(err);
});

// Unified Error Handling Middleware MUST be last
app.use(errorHandler);

// Start Server
const port = process.env.PORT || 3001;

app.listen(port, () => {
  logger.info(`🚀 API Server running on http://localhost:${port}`);
  logger.info(`📍 Routes available at:`);
  logger.info(`   - /hcgi/api/* (primary - for Hostinger /hcgi/ deployment)`);
  logger.info(`   - /api/* (fallback - for local development)`);
  logger.info(`   - /api/integrations/contact-form (contact form endpoint)`);
  logger.info(`   - /api/integrations/facebook (Facebook Lead Ads webhook)`);
  logger.info(`   - /api/integrations/whatsapp (WhatsApp webhook)`);
});

export default app;
